import { beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS, clearStoredData, loadHistory, loadSettings, saveHistory, saveSettings } from './storage';
import type { HistoryEntry } from '../types';

describe('local persistence', () => {
  beforeEach(() => localStorage.clear());

  it('uses safe defaults for missing settings', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips settings', () => {
    const settings = { ...DEFAULT_SETTINGS, precision: 6, theme: 'dark' as const };
    saveSettings(settings);
    expect(loadSettings()).toEqual(settings);
  });

  it('drops malformed history instead of crashing', () => {
    localStorage.setItem('thermoshift.history.v1', JSON.stringify([null, { id: 3 }, { id: 'x', createdAt: 'now', input: 1, output: 2, from: 'invalid', to: 'kelvin' }]));
    expect(loadHistory()).toEqual([]);
  });

  it('limits history to fifty records', () => {
    const history: HistoryEntry[] = Array.from({ length: 55 }, (_, index) => ({
      id: String(index),
      createdAt: new Date(0).toISOString(),
      input: index,
      output: index,
      from: 'celsius',
      to: 'kelvin',
    }));
    saveHistory(history);
    expect(loadHistory()).toHaveLength(50);
  });

  it('clears all ThermoShift stored data', () => {
    saveSettings(DEFAULT_SETTINGS);
    saveHistory([]);
    clearStoredData();
    expect(localStorage.getItem('thermoshift.settings.v1')).toBeNull();
    expect(localStorage.getItem('thermoshift.history.v1')).toBeNull();
  });
});
