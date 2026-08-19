import { useCallback, useEffect, useState } from 'react';

import { AboutPanel } from './components/AboutPanel';
import { BatchConverter } from './components/BatchConverter';
import { ConverterPanel } from './components/ConverterPanel';
import { FormulaPanel } from './components/FormulaPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { OnboardingDialog } from './components/OnboardingDialog';
import { QuickActions, type QuickActionPage } from './components/QuickActions';
import { ReferenceCards } from './components/ReferenceCards';
import { SettingsPanel } from './components/SettingsPanel';
import { en } from './i18n/en';
import { getTemperatureEngine, type TemperatureEngine } from './lib/engine';
import { logEvent } from './lib/logger';
import {
  clearStoredData,
  DEFAULT_SETTINGS,
  loadHistory,
  loadOnboardingComplete,
  loadSettings,
  saveHistory,
  saveOnboardingComplete,
  saveSettings,
} from './lib/storage';
import type { ConversionResult, HistoryEntry, Settings } from './types';

const PAGES: readonly QuickActionPage[] = ['converter', 'batch', 'history', 'formulas', 'settings', 'about'];

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.matches('input, textarea, select');
};

function App() {
  const [engine, setEngine] = useState<TemperatureEngine>();
  const [engineFailed, setEngineFailed] = useState(false);
  const [page, setPage] = useState<QuickActionPage>('converter');
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [online, setOnline] = useState(navigator.onLine);
  const [showOnboarding, setShowOnboarding] = useState(() => !loadOnboardingComplete());
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  useEffect(() => {
    void getTemperatureEngine().then(setEngine).catch((error: unknown) => {
      logEvent('error', 'engine.init_failed', { error });
      setEngineFailed(true);
    });
  }, []);

  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveHistory(history), [history]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    addEventListener('online', update);
    addEventListener('offline', update);
    return () => { removeEventListener('online', update); removeEventListener('offline', update); };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('reduced-motion', settings.reducedMotion);
  }, [settings]);

  useEffect(() => {
    document.title = `${en.nav[page]} · ${en.appName}`;
  }, [page]);

  const navigate = useCallback((nextPage: QuickActionPage) => setPage(nextPage), []);
  const openQuickActions = useCallback(() => setQuickActionsOpen(true), []);
  const closeQuickActions = useCallback(() => setQuickActionsOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const commandPaletteShortcut = (event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k';
      if (commandPaletteShortcut) {
        if (showOnboarding) return;
        event.preventDefault();
        openQuickActions();
        return;
      }

      if (showOnboarding || quickActionsOpen) return;

      if (event.altKey && /^[1-6]$/.test(event.key) && !isEditableTarget(event.target)) {
        const target = PAGES[Number(event.key) - 1];
        if (target) {
          event.preventDefault();
          navigate(target);
        }
      }
    };
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, [navigate, openQuickActions, quickActionsOpen, showOnboarding]);

  const saveConversion = (result: ConversionResult) => {
    const entry: HistoryEntry = { ...result, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setHistory((current) => [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 50));
  };

  const deleteHistoryEntry = (id: string) => setHistory((current) => current.filter((entry) => entry.id !== id));

  const restoreHistory = (entries: HistoryEntry[]) => {
    setHistory((current) => {
      const byId = new Map(current.map((entry) => [entry.id, entry]));
      for (const entry of entries) byId.set(entry.id, entry);
      return [...byId.values()]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 50);
    });
  };

  const resetLocalData = () => {
    clearStoredData();
    setHistory([]);
    setSettings(DEFAULT_SETTINGS);
    setShowOnboarding(true);
    setPage('converter');
  };

  const restoreLocalData = (nextSettings: Settings, nextHistory: HistoryEntry[]) => {
    setSettings(nextSettings);
    setHistory(nextHistory);
    saveOnboardingComplete(true);
    setShowOnboarding(false);
  };

  const completeOnboarding = (destination: QuickActionPage = 'converter') => {
    saveOnboardingComplete(true);
    setShowOnboarding(false);
    setPage(destination);
  };

  if (engineFailed) {
    return <main className="app-shell"><section className="panel error" role="alert"><h1>{en.states.startErrorTitle}</h1><p>{en.states.startErrorHelp}</p></section></main>;
  }

  if (!engine) {
    return <main className="loading-screen"><img src="/logo.svg" width="84" height="84" alt="" /><h1>{en.appName}</h1><p>{en.states.loadingEngine}</p></main>;
  }

  const appVersion = engine.version();

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{en.shell.skipToContent}</a>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{en.nav[page]}</p>
      <header className="topbar">
        <div className="brand"><img src="/logo.svg" width="40" height="40" alt="" /><div><strong>{en.appName}</strong><span>{en.tagline}</span></div></div>
        <div className="topbar-actions">
          <button className="quick-actions-button" type="button" onClick={openQuickActions} aria-keyshortcuts="Control+K Meta+K">{en.shell.quickActions} <kbd>Ctrl K</kbd></button>
          <nav aria-label={en.shell.primaryNavigation}>
            {PAGES.map((item, index) => <button key={item} type="button" className={page === item ? 'active' : ''} onClick={() => navigate(item)} aria-current={page === item ? 'page' : undefined} aria-keyshortcuts={`Alt+${index + 1}`}>{en.nav[item]} <kbd>Alt+{index + 1}</kbd></button>)}
          </nav>
        </div>
      </header>

      {!online && <div className="offline-banner" role="status">{en.states.offline}</div>}

      <main id="main-content">
        {page === 'converter' && <><ConverterPanel engine={engine} settings={settings} onSave={saveConversion} /><ReferenceCards engine={engine} settings={settings} /></>}
        {page === 'batch' && <BatchConverter engine={engine} settings={settings} />}
        {page === 'history' && <HistoryPanel history={history} settings={settings} onClear={() => setHistory([])} onDelete={deleteHistoryEntry} onRestore={restoreHistory} />}
        {page === 'formulas' && <FormulaPanel />}
        {page === 'settings' && <SettingsPanel settings={settings} history={history} appVersion={appVersion} onChange={setSettings} onRestoreData={restoreLocalData} onResetData={resetLocalData} />}
        {page === 'about' && <AboutPanel engineVersion={appVersion} />}
      </main>

      <footer><span>{en.madeBy}</span><a href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">{en.shell.support}</a></footer>

      <QuickActions open={quickActionsOpen} onClose={closeQuickActions} onNavigate={navigate} />
      {showOnboarding && <OnboardingDialog onComplete={() => completeOnboarding()} onOpenSettings={() => completeOnboarding('settings')} />}
    </div>
  );
}
