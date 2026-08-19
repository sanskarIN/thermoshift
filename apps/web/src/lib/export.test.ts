import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ConversionResult, HistoryEntry } from '../types';
import { conversionsToCsv, downloadText, historyToJson } from './export';

const conversion: ConversionResult = {
  input: 100,
  output: 212,
  from: 'celsius',
  to: 'fahrenheit',
};

const history: HistoryEntry[] = [{
  ...conversion,
  id: 'saved-1',
  createdAt: '2026-08-19T00:00:00.000Z',
}];

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('export helpers', () => {
  it('serializes conversions to a stable CSV shape', () => {
    expect(conversionsToCsv([conversion])).toBe('input,input_unit,output,output_unit\n100,°C,212,°F');
  });

  it('serializes history with a versioned JSON envelope', () => {
    const parsed = JSON.parse(historyToJson(history)) as { schemaVersion: number; exportedAt: string; history: HistoryEntry[] };
    expect(parsed.schemaVersion).toBe(1);
    expect(Number.isFinite(Date.parse(parsed.exportedAt))).toBe(true);
    expect(parsed.history).toEqual(history);
  });

  it('downloads text through a temporary object URL and revokes it', () => {
    vi.useFakeTimers();
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-export');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    downloadText('sample.csv', 'a,b', 'text/csv');
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-export');
  });

  it('removes the temporary anchor and schedules URL revocation when browser download dispatch fails', () => {
    vi.useFakeTimers();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:failed-export');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      throw new Error('download dispatch failed');
    });

    expect(() => downloadText('sample.csv', 'a,b', 'text/csv')).toThrow('download dispatch failed');
    expect(document.querySelector('a[download="sample.csv"]')).not.toBeInTheDocument();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:failed-export');
  });
});
