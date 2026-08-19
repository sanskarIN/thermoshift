import type { RoundingMode } from '../types';

const MIN_PRECISION = 0;
const MAX_PRECISION = 12;
const pow10 = (precision: number): number => 10 ** precision;
const clampPrecision = (precision: number): number => Math.min(MAX_PRECISION, Math.max(MIN_PRECISION, Math.trunc(precision)));

export const roundNumber = (value: number, precision: number, mode: RoundingMode): number => {
  const safePrecision = clampPrecision(precision);
  const factor = pow10(safePrecision);
  const scaled = value * factor;

  // Keep very large finite values finite when scaling would overflow solely for
  // presentation rounding. Intl.NumberFormat can still format the original value.
  if (Number.isFinite(value) && !Number.isFinite(scaled)) return value;

  if (mode === 'truncate') {
    return Math.trunc(scaled) / factor;
  }

  const magnitude = Math.abs(scaled);
  const representationTolerance = Number.EPSILON * Math.max(1, magnitude);
  const roundedMagnitude = Math.floor(magnitude + 0.5 + representationTolerance);
  const rounded = Math.sign(scaled) * roundedMagnitude / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
};

export const formatNumber = (value: number, precision: number, mode: RoundingMode): string => {
  const safePrecision = clampPrecision(precision);
  const rounded = roundNumber(value, safePrecision, mode);
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: safePrecision,
    minimumFractionDigits: 0,
    useGrouping: true,
  }).format(Object.is(rounded, -0) ? 0 : rounded);
};
