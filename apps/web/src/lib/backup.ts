import type { HistoryEntry, Settings } from '../types';
import { HISTORY_LIMIT, isHistoryEntry, isSettings, sanitizeHistory, sanitizeSettings } from './storage';

export const BACKUP_SCHEMA_VERSION = 1 as const;
export const BACKUP_MAX_BYTES = 256 * 1024;

export type BackupValidationCode =
  | 'too-large'
  | 'invalid-json'
  | 'not-backup'
  | 'unsupported-schema'
  | 'invalid-exported-at'
  | 'invalid-settings'
  | 'invalid-history'
  | 'history-limit'
  | 'invalid-history-entry'
  | 'duplicate-history-id';

export class BackupValidationError extends Error {
  readonly code: BackupValidationCode;

  constructor(code: BackupValidationCode) {
    super(`Backup validation failed: ${code}`);
    this.name = 'BackupValidationError';
    this.code = code;
  }
}

export interface ThermoShiftBackup {
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  settings: Settings;
  history: HistoryEntry[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const invalidBackup = (code: BackupValidationCode): BackupValidationError => new BackupValidationError(code);

export const createBackup = (settings: Settings, history: HistoryEntry[]): string => {
  const backup: ThermoShiftBackup = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings: sanitizeSettings(settings),
    history: sanitizeHistory(history),
  };
  return JSON.stringify(backup, null, 2);
};

export const parseBackup = (text: string): ThermoShiftBackup => {
  if (new TextEncoder().encode(text).byteLength > BACKUP_MAX_BYTES) {
    throw invalidBackup('too-large');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw invalidBackup('invalid-json');
  }

  if (!isRecord(parsed)) throw invalidBackup('not-backup');
  if (parsed.schemaVersion !== BACKUP_SCHEMA_VERSION) throw invalidBackup('unsupported-schema');
  if (typeof parsed.exportedAt !== 'string' || !Number.isFinite(Date.parse(parsed.exportedAt))) {
    throw invalidBackup('invalid-exported-at');
  }
  if (!isSettings(parsed.settings)) throw invalidBackup('invalid-settings');
  if (!Array.isArray(parsed.history)) throw invalidBackup('invalid-history');
  if (parsed.history.length > HISTORY_LIMIT) throw invalidBackup('history-limit');
  if (!parsed.history.every(isHistoryEntry)) throw invalidBackup('invalid-history-entry');

  const historyIds = parsed.history.map((entry) => entry.id);
  if (new Set(historyIds).size !== historyIds.length) {
    throw invalidBackup('duplicate-history-id');
  }

  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: parsed.exportedAt,
    settings: sanitizeSettings(parsed.settings),
    history: sanitizeHistory(parsed.history),
  };
};
