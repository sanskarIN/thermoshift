import { useEffect, useState } from 'react';

import { AboutPanel } from './components/AboutPanel';
import { BatchConverter } from './components/BatchConverter';
import { ConverterPanel } from './components/ConverterPanel';
import { FormulaPanel } from './components/FormulaPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { ReferenceCards } from './components/ReferenceCards';
import { SettingsPanel } from './components/SettingsPanel';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { en } from './i18n/en';
import { getTemperatureEngine, type TemperatureEngine } from './lib/engine';
import { clearStoredData, DEFAULT_SETTINGS, loadHistory, loadSettings, saveHistory, saveSettings } from './lib/storage';
import type { ConversionResult, HistoryEntry, Settings, UnitId } from './types';

const PAGES = ['converter', 'batch', 'history', 'formulas', 'settings', 'about'] as const;
type Page = typeof PAGES[number];

function App() {
  const [engine, setEngine] = useState<TemperatureEngine>();
  const [engineError, setEngineError] = useState<string>();
  const [page, setPage] = useState<Page>('converter');
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [online, setOnline] = useState(navigator.onLine);
  const { canInstall, install } = useInstallPrompt();
  const referenceUnit: UnitId = 'celsius';

  useEffect(() => {
    getTemperatureEngine().then(setEngine).catch((error: unknown) => setEngineError(error instanceof Error ? error.message : String(error)));
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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && /^[1-6]$/.test(event.key)) {
        const target = PAGES[Number(event.key) - 1];
        if (target) {
          event.preventDefault();
          setPage(target);
        }
      }
    };
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, []);

  const saveConversion = (result: ConversionResult) => {
    const entry: HistoryEntry = { ...result, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setHistory((current) => [entry, ...current].slice(0, 50));
  };

  const resetLocalData = () => {
    clearStoredData();
    setHistory([]);
    setSettings(DEFAULT_SETTINGS);
  };

  if (engineError) {
    return <main className="app-shell"><section className="panel error" role="alert"><h1>ThermoShift could not start</h1><p>{engineError}</p><p>Reload the app. If the problem persists, see the troubleshooting guide in the repository.</p></section></main>;
  }

  if (!engine) {
    return <main className="loading-screen"><img src="/logo.svg" width="84" height="84" alt="" /><h1>ThermoShift</h1><p>{en.states.loadingEngine}</p></main>;
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="topbar">
        <div className="brand"><img src="/logo.svg" width="40" height="40" alt="" /><div><strong>{en.appName}</strong><span>{en.tagline}</span></div></div>
        <div className="topbar-actions">
          {canInstall && <button type="button" className="install-button" onClick={() => void install()}>{en.installApp}</button>}
          <nav aria-label="Primary">
            {PAGES.map((item, index) => <button key={item} type="button" className={page === item ? 'active' : ''} onClick={() => setPage(item)} aria-current={page === item ? 'page' : undefined}>{en.nav[item]} <kbd>Alt+{index + 1}</kbd></button>)}
          </nav>
        </div>
      </header>

      {!online && <div className="offline-banner" role="status">{en.states.offline}</div>}

      <main id="main-content">
        {page === 'converter' && <><ConverterPanel engine={engine} settings={settings} onSave={saveConversion} /><ReferenceCards engine={engine} settings={settings} unit={referenceUnit} /></>}
        {page === 'batch' && <BatchConverter engine={engine} settings={settings} />}
        {page === 'history' && <HistoryPanel history={history} settings={settings} onClear={() => setHistory([])} />}
        {page === 'formulas' && <FormulaPanel />}
        {page === 'settings' && <SettingsPanel settings={settings} onChange={setSettings} onResetData={resetLocalData} />}
        {page === 'about' && <AboutPanel engineVersion={engine.version()} />}
      </main>

      <footer><span>{en.madeBy}</span><a href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">Support ThermoShift ☕</a></footer>
    </div>
  );
}

export default App;
