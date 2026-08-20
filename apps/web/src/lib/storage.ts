import { UNIT_IDS } from '../data/units';
import type { HistoryEntry, Settings, UnitId } from '../types';

const SETTINGS_KEY = 'thermoshift.settings.v1';
const HISTORY_KEY = 'thermoshift.history.v1';
const HISTORY_LIMIT = 50;

export const DEFAULT_SETTINGS: Settings = {
  precision: 2,
  roundingMode: 'half-up',
  theme: 'system',
  highContrast: false,
  reducedMotion: false,
};

export const loadSettings = (): Settings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const precision = typeof parsed.precision === 'number'
      && Number.isInteger(parsed.precision)
      && parsed.precision >= 0
      && parsed.precision <= 12
      ? parsed.precision
      : DEFAULT_SETTINGS.precision;
    return {
      precision,
      roundingMode: parsed.roundingMode === 'truncate' ? 'truncate' : 'half-up',
      theme: parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system' ? parsed.theme : 'system',
      highContrast: parsed.highContrast === true,
      reducedMotion: parsed.reducedMotion === true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Persistence is best-effort. Keep the in-memory app usable when storage is denied or full.
  }
};

const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // A failed cleanup must not make the settings screen or app unusable.
  }
};

const usesDefaultSettings = (settings: Settings): boolean => settings.precision === DEFAULT_SETTINGS.precision
  && settings.roundingMode === DEFAULT_SETTINGS.roundingMode
  && settings.theme === DEFAULT_SETTINGS.theme
  && settings.highContrast === DEFAULT_SETTINGS.highContrast
  && settings.reducedMotion === DEFAULT_SETTINGS.reducedMotion;

export const saveSettings = (settings: Settings): void => {
  if (usesDefaultSettings(settings)) {
    safeRemoveItem(SETTINGS_KEY);
    return;
  }
  safeSetItem(SETTINGS_KEY, JSON.stringify(settings));
};

const isUnitId = (value: unknown): value is UnitId => typeof value === 'string' && UNIT_IDS.has(value as UnitId);

const isHistoryEntry = (value: unknown): value is HistoryEntry => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<HistoryEntry>;
  return typeof candidate.id === 'string'
    && candidate.id.trim().length > 0
    && typeof candidate.createdAt === 'string'
    && Number.isFinite(Date.parse(candidate.createdAt))
    && typeof candidate.input === 'number'
    && Number.isFinite(candidate.input)
    && typeof candidate.output === 'number'
    && Number.isFinite(candidate.output)
    && isUnitId(candidate.from)
    && isUnitId(candidate.to);
};

export const loadHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isHistoryEntry).slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
};

export const saveHistory = (history: HistoryEntry[]): void => {
  if (history.length === 0) {
    safeRemoveItem(HISTORY_KEY);
    return;
  }
  safeSetItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
};

export const clearStoredData = (): void => {
  safeRemoveItem(SETTINGS_KEY);
  safeRemoveItem(HISTORY_KEY);
};
