import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_SETTINGS,
  HISTORY_KEY,
  ONBOARDING_KEY,
  SETTINGS_KEY,
  clearStoredData,
  loadHistory,
  loadOnboardingComplete,
  loadSettings,
  sanitizeSettings,
  saveHistory,
  saveOnboardingComplete,
  saveSettings,
} from './storage';
import type { HistoryEntry } from '../types';

describe('local persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('uses safe defaults for missing settings', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips settings', () => {
    const settings = { ...DEFAULT_SETTINGS, precision: 6, theme: 'dark' as const };
    saveSettings(settings);
    expect(loadSettings()).toEqual(settings);
  });

  it('normalizes malformed settings fields independently', () => {
    expect(sanitizeSettings({ precision: -1, roundingMode: 'wat', theme: 'dark', highContrast: true, reducedMotion: 'yes' })).toEqual({
      ...DEFAULT_SETTINGS,
      theme: 'dark',
      highContrast: true,
    });
  });

  it('drops malformed history instead of crashing', () => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([
      null,
      { id: 3 },
      { id: 'x', createdAt: 'now', input: 1, output: 2, from: 'invalid', to: 'kelvin' },
    ]));
    expect(loadHistory()).toEqual([]);
  });

  it('limits history to fifty records', () => {
    const history: HistoryEntry[] = Array.from({ length: 55 }, (_, index) => ({
      id: String(index),
      createdAt: new Date(index).toISOString(),
      input: index,
      output: index,
      from: 'celsius',
      to: 'kelvin',
    }));
    saveHistory(history);
    expect(loadHistory()).toHaveLength(50);
  });

  it('persists onboarding completion separately from settings', () => {
    expect(loadOnboardingComplete()).toBe(false);
    saveOnboardingComplete(true);
    expect(loadOnboardingComplete()).toBe(true);
    saveOnboardingComplete(false);
    expect(loadOnboardingComplete()).toBe(false);
  });

  it('keeps the in-memory app safe if browser storage writes throw', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(() => saveSettings(DEFAULT_SETTINGS)).not.toThrow();
    expect(() => saveHistory([])).not.toThrow();
    expect(() => saveOnboardingComplete(true)).not.toThrow();
  });

  it('clears all ThermoShift stored data', () => {
    saveSettings(DEFAULT_SETTINGS);
    saveHistory([]);
    saveOnboardingComplete(true);
    clearStoredData();
    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull();
    expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
    expect(localStorage.getItem(ONBOARDING_KEY)).toBeNull();
  });
});
