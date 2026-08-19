export type UnitId =
  | 'celsius'
  | 'fahrenheit'
  | 'kelvin'
  | 'rankine'
  | 'reaumur'
  | 'delisle'
  | 'newton'
  | 'romer';

export interface UnitDefinition {
  id: UnitId;
  name: string;
  symbol: string;
  description: string;
}

export type ThemePreference = 'system' | 'light' | 'dark';
export type RoundingMode = 'half-up' | 'truncate';

export interface Settings {
  precision: number;
  roundingMode: RoundingMode;
  theme: ThemePreference;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  input: number;
  output: number;
  from: UnitId;
  to: UnitId;
}

export interface ConversionResult {
  input: number;
  output: number;
  from: UnitId;
  to: UnitId;
}
