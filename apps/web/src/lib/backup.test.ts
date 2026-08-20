import { describe, expect, it } from 'vitest';

import type { HistoryEntry } from '../types';
import { BACKUP_MAX_BYTES, BackupValidationError, type BackupValidationCode, createBackup, parseBackup } from './backup';
import { DEFAULT_SETTINGS, HISTORY_LIMIT } from './storage';

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

const expectValidationCode = (action: () => unknown, code: BackupValidationCode) => {
  let caught: unknown;
  try {
    action();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(BackupValidationError);
  expect((caught as BackupValidationError).code).toBe(code);
};

describe('ThermoShift backups', () => {
  it('round-trips settings and history', () => {
    const settings = { ...DEFAULT_SETTINGS, precision: 5, theme: 'dark' as const };
    const parsed = parseBackup(createBackup(settings, history));
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.settings).toEqual(settings);
    expect(parsed.history).toEqual(history);
  });

  it('uses stable typed validation codes instead of user-facing parser copy', () => {
    expectValidationCode(() => parseBackup('{not-json'), 'invalid-json');
    expectValidationCode(() => parseBackup('[]'), 'not-backup');
    expectValidationCode(() => parseBackup('x'.repeat(BACKUP_MAX_BYTES + 1)), 'too-large');
  });

  it('rejects unsupported schema versions without preserving untrusted detail', () => {
    expectValidationCode(() => parseBackup(JSON.stringify(validBackup({ schemaVersion: '<script>untrusted</script>' }))), 'unsupported-schema');
  });

  it('rejects a missing or invalid export timestamp', () => {
    expectValidationCode(() => parseBackup(JSON.stringify(validBackup({ exportedAt: 'invalid-date' }))), 'invalid-exported-at');
    expectValidationCode(() => parseBackup(JSON.stringify(validBackup({ exportedAt: undefined }))), 'invalid-exported-at');
  });

  it('rejects malformed settings instead of silently replacing fields with defaults', () => {
    expectValidationCode(() => parseBackup(JSON.stringify(validBackup({
      settings: { ...DEFAULT_SETTINGS, precision: 500 },
    }))), 'invalid-settings');
    expectValidationCode(() => parseBackup(JSON.stringify(validBackup({
      settings: { ...DEFAULT_SETTINGS, highContrast: 'yes' },
    }))), 'invalid-settings');
  });

  it('rejects missing and oversized history collections', () => {
    expectValidationCode(() => parseBackup(JSON.stringify(validBackup({ history: 'not-an-array' }))), 'invalid-history');
    const tooMany = Array.from({ length: HISTORY_LIMIT + 1 }, (_, index) => ({
      ...history[0],
      id: `entry-${index}`,
    }));
    expectValidationCode(() => parseBackup(JSON.stringify(validBackup({ history: tooMany }))), 'history-limit');
  });

  it('rejects invalid history rows instead of partially restoring them', () => {
    const invalidHistory = [{ ...history[0], from: 'bogus' }];
    expectValidationCode(() => parseBackup(JSON.stringify(validBackup({ history: invalidHistory }))), 'invalid-history-entry');
  });

  it('rejects duplicate history identifiers instead of silently dropping data', () => {
    expectValidationCode(() => parseBackup(JSON.stringify(validBackup({
      history: [history[0], { ...history[0], input: 100, output: 212 }],
    }))), 'duplicate-history-id');
  });
});