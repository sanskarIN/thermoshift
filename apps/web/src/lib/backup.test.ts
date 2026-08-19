import { describe, expect, it } from 'vitest';

import type { HistoryEntry } from '../types';
import { BACKUP_MAX_BYTES, createBackup, parseBackup } from './backup';
import { DEFAULT_SETTINGS } from './storage';

const history: HistoryEntry[] = [{
  id: 'entry-1',
  createdAt: '2026-08-19T00:00:00.000Z',
  input: 0,
  output: 32,
  from: 'celsius',
  to: 'fahrenheit',
}];

describe('ThermoShift backups', () => {
  it('round-trips settings and history', () => {
    const settings = { ...DEFAULT_SETTINGS, precision: 5, theme: 'dark' as const };
    const parsed = parseBackup(createBackup(settings, history));
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.settings).toEqual(settings);
    expect(parsed.history).toEqual(history);
  });

  it('rejects malformed JSON', () => {
    expect(() => parseBackup('{not-json')).toThrow(/valid JSON/i);
  });

  it('rejects oversized payloads before parsing', () => {
    expect(() => parseBackup('x'.repeat(BACKUP_MAX_BYTES + 1))).toThrow(/larger than 256 KiB/i);
  });

  it('rejects unsupported schema versions', () => {
    expect(() => parseBackup(JSON.stringify({ schemaVersion: 99, settings: {}, history: [] }))).toThrow(/unsupported backup schema/i);
  });

  it('rejects invalid history rows instead of partially restoring them', () => {
    const invalid = {
      schemaVersion: 1,
      exportedAt: '2026-08-19T00:00:00.000Z',
      settings: DEFAULT_SETTINGS,
      history: [{ ...history[0], from: 'bogus' }],
    };
    expect(() => parseBackup(JSON.stringify(invalid))).toThrow(/invalid conversion entry/i);
  });

  it('normalizes unsafe settings while preserving valid backup data', () => {
    const backup = {
      schemaVersion: 1,
      exportedAt: 'invalid-date',
      settings: { precision: 500, theme: 'neon', highContrast: 'yes' },
      history,
    };
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.settings).toEqual(DEFAULT_SETTINGS);
    expect(parsed.exportedAt).toBe(new Date(0).toISOString());
  });
});
