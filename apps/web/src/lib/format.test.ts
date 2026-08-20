import { describe, expect, it } from 'vitest';

import { formatNumber, roundNumber } from './format';

describe('roundNumber', () => {
  it('rounds positive halves away from zero', () => {
    expect(roundNumber(12.345, 2, 'half-up')).toBe(12.35);
    expect(roundNumber(1.005, 2, 'half-up')).toBe(1.01);
  });

  it('rounds negative halves away from zero', () => {
    expect(roundNumber(-12.345, 2, 'half-up')).toBe(-12.35);
    expect(roundNumber(-1.005, 2, 'half-up')).toBe(-1.01);
  });

  it('truncates without rounding', () => {
    expect(roundNumber(12.349, 2, 'truncate')).toBe(12.34);
    expect(roundNumber(-12.349, 2, 'truncate')).toBe(-12.34);
  });

  it('clamps precision to safe limits', () => {
    expect(roundNumber(1.9, -10, 'half-up')).toBe(2);
  });

  it('keeps very large finite values finite when decimal shifting would overflow', () => {
    expect(roundNumber(Number.MAX_VALUE, 12, 'half-up')).toBe(Number.MAX_VALUE);
  });
});

describe('formatNumber', () => {
  it('normalizes negative zero', () => {
    expect(formatNumber(-0, 2, 'half-up')).toBe('0');
  });

  it('uses the same precision clamp as roundNumber', () => {
    expect(() => formatNumber(1.2345, 100, 'half-up')).not.toThrow();
  });
});
