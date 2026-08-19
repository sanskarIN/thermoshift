import type { HistoryEntry, Settings } from '../types';
import { HISTORY_LIMIT, isHistoryEntry, isSettings, sanitizeHistory, sanitizeSettings } from './storage';

export const BACKUP_SCHEMA_VERSION = 1 as const;
export const BACKUP_MAX_BYTES = 256 * 1024;

export class BackupValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupValidationError';
  }
}

export interface ThermoShiftBackup {
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  settings: Settings;
  history: HistoryEntry[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const invalidBackup = (message: string): BackupValidationError => new BackupValidationError(message);

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
    throw invalidBackup('The selected backup is larger than 256 KiB.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw invalidBackup('The selected file is not valid JSON.');
  }

  if (!isRecord(parsed)) throw invalidBackup('The selected file is not a ThermoShift backup.');
  if (parsed.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    throw invalidBackup(`Unsupported backup schema version: ${String(parsed.schemaVersion)}.`);
  }
  if (typeof parsed.exportedAt !== 'string' || !Number.isFinite(Date.parse(parsed.exportedAt))) {
    throw invalidBackup('Backup export timestamp is missing or invalid.');
  }
  if (!isSettings(parsed.settings)) throw invalidBackup('Backup settings are missing or invalid.');
  if (!Array.isArray(parsed.history)) throw invalidBackup('Backup history is missing or invalid.');
  if (parsed.history.length > HISTORY_LIMIT) throw invalidBackup(`Backup contains more than ${HISTORY_LIMIT} history entries.`);
  if (!parsed.history.every(isHistoryEntry)) throw invalidBackup('Backup history contains an invalid conversion entry.');

  const historyIds = parsed.history.map((entry) => entry.id);
  if (new Set(historyIds).size !== historyIds.length) {
    throw invalidBackup('Backup history contains duplicate conversion identifiers.');
  }

  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: parsed.exportedAt,
    settings: sanitizeSettings(parsed.settings),
    history: sanitizeHistory(parsed.history),
  };
};
