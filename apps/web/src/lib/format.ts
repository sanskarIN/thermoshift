import type { RoundingMode } from '../types';

const MIN_PRECISION = 0;
const MAX_PRECISION = 12;
const clampPrecision = (precision: number): number => Math.min(MAX_PRECISION, Math.max(MIN_PRECISION, Math.trunc(precision)));

const shiftDecimal = (value: number, places: number): number => {
  if (!Number.isFinite(value) || value === 0) return value;
  const [coefficient, exponent = '0'] = value.toString().toLowerCase().split('e');
  return Number(`${coefficient}e${Number(exponent) + places}`);
};

export const roundNumber = (value: number, precision: number, mode: RoundingMode): number => {
  const safePrecision = clampPrecision(precision);
  const sign = Math.sign(value);
  const shifted = shiftDecimal(Math.abs(value), safePrecision);

  // A finite value can overflow only because decimal shifting is being used for
  // presentation rounding. Preserve the original finite value in that case.
  if (Number.isFinite(value) && !Number.isFinite(shifted)) return value;

  const adjusted = mode === 'truncate' ? Math.trunc(shifted) : Math.round(shifted);
  const rounded = sign * shiftDecimal(adjusted, -safePrecision);
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
