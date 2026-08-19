import { useState, type ChangeEvent } from 'react';

import { createBackup, parseBackup } from '../lib/backup';
import { downloadText } from '../lib/export';
import type { HistoryEntry, Settings } from '../types';

interface Props {
  settings: Settings;
  history: HistoryEntry[];
  onChange: (settings: Settings) => void;
  onRestoreData: (settings: Settings, history: HistoryEntry[]) => void;
  onResetData: () => void;
}

export function SettingsPanel({ settings, history, onChange, onRestoreData, onResetData }: Props) {
  const [dataNotice, setDataNotice] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const patch = (next: Partial<Settings>) => onChange({ ...settings, ...next });

  const updatePrecision = (raw: string) => {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) patch({ precision: Math.min(12, Math.max(0, Math.trunc(parsed))) });
  };

  const exportBackup = () => {
    const day = new Date().toISOString().slice(0, 10);
    downloadText(`thermoshift-backup-${day}.json`, createBackup(settings, history), 'application/json');
    setDataError(null);
    setDataNotice('Backup exported. Keep the file somewhere you trust.');
  };

  const restoreBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const backup = parseBackup(await file.text());
      onRestoreData(backup.settings, backup.history);
      setDataError(null);
      setDataNotice(`Backup restored with ${backup.history.length} saved conversion${backup.history.length === 1 ? '' : 's'}.`);
    } catch (caught) {
      setDataNotice(null);
      setDataError(caught instanceof Error ? caught.message : 'Backup restore failed.');
    } finally {
      input.value = '';
    }
  };

  const reset = () => {
    if (!window.confirm('Reset ThermoShift settings, history, and onboarding state on this device? This cannot be undone.')) return;
    onResetData();
    setDataError(null);
    setDataNotice('Local ThermoShift data was reset.');
  };

  return (
    <section className="panel" aria-labelledby="settings-title">
      <div className="panel-heading"><div><p className="eyebrow">Make it yours</p><h2 id="settings-title">Settings</h2></div></div>

      <div className="settings-section">
        <h3>Conversion</h3>
        <div className="settings-grid">
          <label><span>Decimal precision</span><input type="number" min="0" max="12" value={settings.precision} onChange={(event) => updatePrecision(event.target.value)} /></label>
          <label><span>Rounding</span><select value={settings.roundingMode} onChange={(event) => patch({ roundingMode: event.target.value === 'truncate' ? 'truncate' : 'half-up' })}><option value="half-up">Round half away from zero</option><option value="truncate">Truncate</option></select></label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Appearance & accessibility</h3>
        <div className="settings-grid">
          <label><span>Theme</span><select value={settings.theme} onChange={(event) => patch({ theme: event.target.value as Settings['theme'] })}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
          <label className="toggle"><input type="checkbox" checked={settings.highContrast} onChange={(event) => patch({ highContrast: event.target.checked })} /><span>High contrast</span></label>
          <label className="toggle"><input type="checkbox" checked={settings.reducedMotion} onChange={(event) => patch({ reducedMotion: event.target.checked })} /><span>Reduce motion</span></label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Privacy & data</h3>
        <p className="helper">Preferences and saved history stay in browser-managed local storage. ThermoShift requires no account. Backups are plain JSON files that you control.</p>
        <div className="action-row">
          <button type="button" onClick={exportBackup}>Export full backup</button>
          <label className="file-button">
            <span>Restore backup</span>
            <input type="file" accept="application/json,.json" onChange={(event) => void restoreBackup(event)} />
          </label>
          <button className="danger-button" type="button" onClick={reset}>Reset local data</button>
        </div>
        {dataNotice && <p className="helper" role="status">{dataNotice}</p>}
        {dataError && <p className="error" role="alert">{dataError}</p>}
      </div>
    </section>
  );
}
