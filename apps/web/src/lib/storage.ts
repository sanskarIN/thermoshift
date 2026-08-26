import { UNIT_IDS } from '../data/units';
import type { HistoryEntry, Settings, UnitId } from '../types';

export const SETTINGS_KEY = 'thermoshift.settings.v1';
export const HISTORY_KEY = 'thermoshift.history.v1';
export const HISTORY_LIMIT = 50;

export const DEFAULT_SETTINGS: Settings = {
  precision: 2,
  roundingMode: 'half-up',
  theme: 'system',
  highContrast: false,
  reducedMotion: false,
};

export const isSettings = (value: unknown): value is Settings => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<Settings>;
  return typeof candidate.precision === 'number'
    && Number.isInteger(candidate.precision)
    && candidate.precision >= 0
    && candidate.precision <= 12
    && (candidate.roundingMode === 'half-up' || candidate.roundingMode === 'truncate')
    && (candidate.theme === 'system' || candidate.theme === 'light' || candidate.theme === 'dark')
    && typeof candidate.highContrast === 'boolean'
    && typeof candidate.reducedMotion === 'boolean';
};

export const sanitizeSettings = (value: unknown): Settings => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return DEFAULT_SETTINGS;
  const parsed = value as Partial<Settings>;
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
};

export const loadSettings = (): Settings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? sanitizeSettings(JSON.parse(raw) as unknown) : DEFAULT_SETTINGS;
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
  const sanitized = sanitizeSettings(settings);
  if (usesDefaultSettings(sanitized)) {
    safeRemoveItem(SETTINGS_KEY);
    return;
  }
  safeSetItem(SETTINGS_KEY, JSON.stringify(sanitized));
};

export const isUnitId = (value: unknown): value is UnitId => typeof value === 'string' && UNIT_IDS.has(value as UnitId);

export const isHistoryEntry = (value: unknown): value is HistoryEntry => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
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

export const sanitizeHistory = (value: unknown): HistoryEntry[] => {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const sanitized: HistoryEntry[] = [];
  for (const candidate of value) {
    if (!isHistoryEntry(candidate) || seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    sanitized.push(candidate);
    if (sanitized.length === HISTORY_LIMIT) break;
  }
  return sanitized;
};

export const loadHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? sanitizeHistory(JSON.parse(raw) as unknown) : [];
  } catch {
    return [];
  }
};

export const saveHistory = (history: HistoryEntry[]): void => {
  const sanitized = sanitizeHistory(history);
  if (sanitized.length === 0) {
    safeRemoveItem(HISTORY_KEY);
    return;
  }
  safeSetItem(HISTORY_KEY, JSON.stringify(sanitized));
};

export const clearStoredData = (): void => {
  safeRemoveItem(SETTINGS_KEY);
  safeRemoveItem(HISTORY_KEY);
};
