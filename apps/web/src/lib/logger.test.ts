import { afterEach, describe, expect, it, vi } from 'vitest';

import { logEvent, sanitizeLogMetadata } from './logger';

afterEach(() => vi.restoreAllMocks());

describe('structured logging', () => {
  it('redacts common secret and PII-shaped metadata keys recursively', () => {
    const sanitized = sanitizeLogMetadata({
      operation: 'startup',
      token: 'secret-token',
      nested: {
        email: 'person@example.com',
        authorization: 'Bearer abc',
        safeCode: 'WASM_INIT',
      },
      values: [{ password: 'pw', reason: 'timeout' }],
    });

    expect(sanitized).toEqual({
      operation: 'startup',
      token: '[REDACTED]',
      nested: {
        email: '[REDACTED]',
        authorization: '[REDACTED]',
        safeCode: 'WASM_INIT',
      },
      values: '[REDACTED]',
    });
  });

  it('reduces Error objects to their type instead of logging raw messages', () => {
    expect(sanitizeLogMetadata({ error: new TypeError('contains user text') })).toEqual({ error: { errorType: 'TypeError' } });
  });

  it('bounds deep and oversized metadata', () => {
    const long = 'x'.repeat(250);
    const sanitized = sanitizeLogMetadata({ safe: long, deep: { a: { b: { c: 'hidden' } } } });
    expect(String(sanitized.safe)).toHaveLength(201);
    expect(sanitized.deep).toEqual({ a: { b: '[MAX_DEPTH]' } });
  });

  it('emits one JSON object to the matching local console level', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    logEvent('warn', 'storage.write_failed', { area: 'settings', token: 'never-log-me' });

    expect(warn).toHaveBeenCalledOnce();
    const serialized = warn.mock.calls[0]?.[0];
    expect(typeof serialized).toBe('string');
    const record = JSON.parse(String(serialized)) as { level: string; event: string; metadata: Record<string, unknown>; timestamp: string };
    expect(record.level).toBe('warn');
    expect(record.event).toBe('storage.write_failed');
    expect(record.metadata).toEqual({ area: 'settings', token: '[REDACTED]' });
    expect(Number.isFinite(Date.parse(record.timestamp))).toBe(true);
  });
});
