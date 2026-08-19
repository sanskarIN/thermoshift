import { describe, expect, it } from 'vitest';

import { formatNumber, roundNumber } from './format';

describe('roundNumber', () => {
  it('rounds positive halves away from zero', () => {
    expect(roundNumber(12.345, 2, 'half-up')).toBe(12.35);
  });

  it('rounds negative halves away from zero', () => {
    expect(roundNumber(-12.345, 2, 'half-up')).toBe(-12.35);
  });

  it('truncates without rounding', () => {
    expect(roundNumber(12.349, 2, 'truncate')).toBe(12.34);
    expect(roundNumber(-12.349, 2, 'truncate')).toBe(-12.34);
  });

  it('clamps precision to safe limits', () => {
    expect(roundNumber(1.9, -10, 'half-up')).toBe(2);
  });
});

describe('formatNumber', () => {
  it('normalizes negative zero', () => {
    expect(formatNumber(-0, 2, 'half-up')).toBe('0');
  });
});
