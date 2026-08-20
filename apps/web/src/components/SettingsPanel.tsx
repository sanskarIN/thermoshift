import { useState, type ChangeEvent } from 'react';

import { en } from '../i18n/en';
import { BACKUP_MAX_BYTES, BackupValidationError, createBackup, parseBackup } from '../lib/backup';
import { downloadText } from '../lib/export';
import { logEvent } from '../lib/logger';
import { HISTORY_LIMIT } from '../lib/storage';
import type { HistoryEntry, Settings } from '../types';
import { ProjectLinks } from './ProjectLinks';
import { UpdatePanel } from './UpdatePanel';

interface Props {
  settings: Settings;
  history: HistoryEntry[];
  appVersion: string;
  onChange: (settings: Settings) => void;
  onRestoreData: (settings: Settings, history: HistoryEntry[]) => void;
  onResetData: () => void;
}

const backupValidationMessage = (error: BackupValidationError): string => {
  switch (error.code) {
    case 'too-large': return en.settings.backupErrors.tooLarge(BACKUP_MAX_BYTES / 1024);
    case 'invalid-json': return en.settings.backupErrors.invalidJson;
    case 'not-backup': return en.settings.backupErrors.notBackup;
    case 'unsupported-schema': return en.settings.backupErrors.unsupportedSchema;
    case 'invalid-exported-at': return en.settings.backupErrors.invalidExportedAt;
    case 'invalid-settings': return en.settings.backupErrors.invalidSettings;
    case 'invalid-history': return en.settings.backupErrors.invalidHistory;
    case 'history-limit': return en.settings.backupErrors.historyLimit(HISTORY_LIMIT);
    case 'invalid-history-entry': return en.settings.backupErrors.invalidHistoryEntry;
    case 'duplicate-history-id': return en.settings.backupErrors.duplicateHistoryId;
  }
};

export function SettingsPanel({ settings, history, appVersion, onChange, onRestoreData, onResetData }: Props) {
  const [dataNotice, setDataNotice] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const patch = (next: Partial<Settings>) => onChange({ ...settings, ...next });

  const updatePrecision = (raw: string) => {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) patch({ precision: Math.min(12, Math.max(0, Math.trunc(parsed))) });
  };

  const exportBackup = () => {
    const day = new Date().toISOString().slice(0, 10);
    try {
      downloadText(`thermoshift-backup-${day}.json`, createBackup(settings, history), 'application/json');
      setDataError(null);
      setDataNotice(en.settings.backupExported);
    } catch (caught) {
      logEvent('warn', 'backup.export_failed', { error: caught });
      setDataNotice(null);
      setDataError(en.settings.backupExportFailed);
    }
  };

  const restoreBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    try {
      if (file.size > BACKUP_MAX_BYTES) throw new BackupValidationError('too-large');
      const backup = parseBackup(await file.text());
      onRestoreData(backup.settings, backup.history);
      setDataError(null);
      setDataNotice(en.settings.backupRestored(backup.history.length));
    } catch (caught) {
      setDataNotice(null);
      if (caught instanceof BackupValidationError) {
        setDataError(backupValidationMessage(caught));
      } else {
        logEvent('error', 'backup.restore_failed', { error: caught });
        setDataError(en.settings.backupFailed);
      }
    } finally {
      input.value = '';
    }
  };

  const reset = () => {
    if (!window.confirm(en.settings.resetConfirm)) return;
    onResetData();
    setDataError(null);
    setDataNotice(en.settings.resetDone);
  };

  return (
    <section className="panel" aria-labelledby="settings-title">
      <div className="panel-heading"><div><p className="eyebrow">{en.settings.eyebrow}</p><h2 id="settings-title">{en.settings.title}</h2></div></div>

      <div className="settings-section">
        <h3>{en.settings.conversion}</h3>
        <div className="settings-grid">
          <label><span>{en.settings.precision}</span><input type="number" min="0" max="12" value={settings.precision} onChange={(event) => updatePrecision(event.target.value)} /></label>
          <label><span>{en.settings.rounding}</span><select value={settings.roundingMode} onChange={(event) => patch({ roundingMode: event.target.value === 'truncate' ? 'truncate' : 'half-up' })}><option value="half-up">{en.settings.roundHalf}</option><option value="truncate">{en.settings.truncate}</option></select></label>
        </div>
      </div>

      <div className="settings-section">
        <h3>{en.settings.appearance}</h3>
        <div className="settings-grid">
          <label><span>{en.settings.theme}</span><select value={settings.theme} onChange={(event) => patch({ theme: event.target.value as Settings['theme'] })}><option value="system">{en.settings.system}</option><option value="light">{en.settings.light}</option><option value="dark">{en.settings.dark}</option></select></label>
          <label className="toggle"><input type="checkbox" checked={settings.highContrast} onChange={(event) => patch({ highContrast: event.target.checked })} /><span>{en.settings.highContrast}</span></label>
          <label className="toggle"><input type="checkbox" checked={settings.reducedMotion} onChange={(event) => patch({ reducedMotion: event.target.checked })} /><span>{en.settings.reducedMotion}</span></label>
        </div>
      </div>

      <UpdatePanel version={appVersion} />

      <div className="settings-section">
        <h3>{en.settings.privacy}</h3>
        <p className="helper">{en.settings.privacyHelp}</p>
        <div className="action-row">
          <button type="button" onClick={exportBackup}>{en.settings.exportBackup}</button>
          <label className="file-button">
            <span>{en.settings.restoreBackup}</span>
            <input type="file" accept="application/json,.json" onChange={(event) => void restoreBackup(event)} />
          </label>
          <button className="danger-button" type="button" onClick={reset}>{en.settings.reset}</button>
        </div>
        {dataNotice && <p className="helper" role="status">{dataNotice}</p>}
        {dataError && <p className="error" role="alert">{dataError}</p>}
      </div>

      <div className="settings-section" aria-labelledby="settings-about-title">
        <h3 id="settings-about-title">{en.about.title}</h3>
        <p className="helper">{en.about.description}</p>
        <p><strong>{en.madeBy}</strong></p>
        <ProjectLinks />
      </div>
    </section>
  );
}
