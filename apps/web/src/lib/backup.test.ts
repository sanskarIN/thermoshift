import { describe, expect, it } from 'vitest';

import type { HistoryEntry } from '../types';
import { BACKUP_MAX_BYTES, BackupValidationError, createBackup, parseBackup } from './backup';
import { DEFAULT_SETTINGS } from './storage';

const history: HistoryEntry[] = [{
  id: 'entry-1',
  createdAt: '2026-08-19T00:00:00.000Z',
  input: 0,
  output: 32,
  from: 'celsius',
  to: 'fahrenheit',
}];

const validBackup = (overrides: Record<string, unknown> = {}) => ({
  schemaVersion: 1,
  exportedAt: '2026-08-19T00:00:00.000Z',
  settings: DEFAULT_SETTINGS,
  history,
  ...overrides,
});

describe('ThermoShift backups', () => {
  it('round-trips settings and history', () => {
    const settings = { ...DEFAULT_SETTINGS, precision: 5, theme: 'dark' as const };
    const parsed = parseBackup(createBackup(settings, history));
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.settings).toEqual(settings);
    expect(parsed.history).toEqual(history);
  });

  it('uses a distinct error type for user-safe validation failures', () => {
    expect(() => parseBackup('{not-json')).toThrow(BackupValidationError);
  });

  it('rejects malformed JSON', () => {
    expect(() => parseBackup('{not-json')).toThrow(/valid JSON/i);
  });

  it('rejects oversized payloads before parsing', () => {
    expect(() => parseBackup('x'.repeat(BACKUP_MAX_BYTES + 1))).toThrow(/larger than 256 KiB/i);
  });

  it('rejects unsupported schema versions', () => {
    expect(() => parseBackup(JSON.stringify(validBackup({ schemaVersion: 99 })))).toThrow(/unsupported backup schema/i);
  });

  it('rejects a missing or invalid export timestamp', () => {
    expect(() => parseBackup(JSON.stringify(validBackup({ exportedAt: 'invalid-date' })))).toThrow(/timestamp.*invalid/i);
    expect(() => parseBackup(JSON.stringify(validBackup({ exportedAt: undefined })))).toThrow(/timestamp.*invalid/i);
  });

  it('rejects malformed settings instead of silently replacing fields with defaults', () => {
    expect(() => parseBackup(JSON.stringify(validBackup({
      settings: { ...DEFAULT_SETTINGS, precision: 500 },
    })))).toThrow(/settings.*invalid/i);
    expect(() => parseBackup(JSON.stringify(validBackup({
      settings: { ...DEFAULT_SETTINGS, highContrast: 'yes' },
    })))).toThrow(/settings.*invalid/i);
  });

  it('rejects invalid history rows instead of partially restoring them', () => {
    const invalidHistory = [{ ...history[0], from: 'bogus' }];
    expect(() => parseBackup(JSON.stringify(validBackup({ history: invalidHistory })))).toThrow(/invalid conversion entry/i);
  });

  it('rejects duplicate history identifiers instead of silently dropping data', () => {
    expect(() => parseBackup(JSON.stringify(validBackup({
      history: [history[0], { ...history[0], input: 100, output: 212 }],
    })))).toThrow(/duplicate conversion identifiers/i);
  });
});