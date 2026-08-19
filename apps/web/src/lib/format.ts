import type { RoundingMode } from '../types';

const pow10 = (precision: number): number => 10 ** precision;

export const roundNumber = (value: number, precision: number, mode: RoundingMode): number => {
  const safePrecision = Math.min(12, Math.max(0, Math.trunc(precision)));
  const factor = pow10(safePrecision);
  const scaled = value * factor;
  if (mode === 'truncate') {
    return Math.trunc(scaled) / factor;
  }
  const rounded = scaled < 0 ? -Math.round(-scaled) : Math.round(scaled);
  return rounded / factor;
};

export const formatNumber = (value: number, precision: number, mode: RoundingMode): string => {
  const rounded = roundNumber(value, precision, mode);
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: precision,
    minimumFractionDigits: 0,
    useGrouping: true,
  }).format(Object.is(rounded, -0) ? 0 : rounded);
};
