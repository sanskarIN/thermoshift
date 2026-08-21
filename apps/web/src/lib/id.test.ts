import { describe, expect, it, vi } from 'vitest';

import { createId } from './id';

describe('createId', () => {
  it('uses the platform UUID generator when available', () => {
    const randomUUID = vi.fn(() => '11111111-2222-4333-8444-555555555555');
    const getRandomValues = vi.fn((array: Uint8Array) => array);

    expect(createId({ randomUUID, getRandomValues })).toBe('11111111-2222-4333-8444-555555555555');
    expect(randomUUID).toHaveBeenCalledOnce();
    expect(getRandomValues).not.toHaveBeenCalled();
  });

  it('creates an RFC 4122 version 4 shaped id from secure random bytes', () => {
    const getRandomValues = vi.fn((array: Uint8Array) => {
      array.set([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]);
      return array;
    });

    expect(createId({ getRandomValues })).toBe('00112233-4455-4677-8899-aabbccddeeff');
    expect(getRandomValues).toHaveBeenCalledOnce();
  });
});
