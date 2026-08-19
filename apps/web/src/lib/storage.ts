import { UNIT_IDS } from '../data/units';
import type { HistoryEntry, Settings, UnitId } from '../types';

export const SETTINGS_KEY = 'thermoshift.settings.v1';
export const HISTORY_KEY = 'thermoshift.history.v1';
export const ONBOARDING_KEY = 'thermoshift.onboarding.v1';
export const HISTORY_LIMIT = 50;

export const DEFAULT_SETTINGS: Settings = {
  precision: 2,
  roundingMode: 'half-up',
  theme: 'system',
  highContrast: false,
  reducedMotion: false,
};

export const sanitizeSettings = (value: unknown): Settings => {
  if (!value || typeof value !== 'object') return DEFAULT_SETTINGS;
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

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitizeSettings(settings)));
  } catch {
    // Browser storage can be unavailable or full. The in-memory app remains usable.
  }
};

export const isUnitId = (value: unknown): value is UnitId => typeof value === 'string' && UNIT_IDS.has(value as UnitId);

export const isHistoryEntry = (value: unknown): value is HistoryEntry => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<HistoryEntry>;
  return typeof candidate.id === 'string'
    && candidate.id.length > 0
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
  return value.filter(isHistoryEntry).slice(0, HISTORY_LIMIT);
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
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sanitizeHistory(history)));
  } catch {
    // Keep conversions available in memory when storage cannot be written.
  }
};

export const loadOnboardingComplete = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'complete';
  } catch {
    return false;
  }
};

export const saveOnboardingComplete = (complete: boolean): void => {
  try {
    if (complete) localStorage.setItem(ONBOARDING_KEY, 'complete');
    else localStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // Onboarding state is non-critical and can remain session-only.
  }
};

export const clearStoredData = (): void => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // No-op when storage is unavailable.
  }
};
