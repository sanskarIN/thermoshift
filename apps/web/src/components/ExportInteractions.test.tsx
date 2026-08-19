import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TemperatureEngine } from '../lib/engine';
import { DEFAULT_SETTINGS } from '../lib/storage';
import type { HistoryEntry } from '../types';
import { BatchConverter } from './BatchConverter';
import { HistoryPanel } from './HistoryPanel';
import { SettingsPanel } from './SettingsPanel';

const engine: TemperatureEngine = {
  convert(value, from, to) {
    if (from === to) return value;
    if (from === 'celsius' && to === 'fahrenheit') return value * 9 / 5 + 32;
    return value;
  },
  absoluteZero: () => -273.15,
  version: () => 'test-engine',
};

const history: HistoryEntry[] = [{
  id: 'export-1',
  createdAt: '2026-08-19T00:00:00.000Z',
  input: 0,
  output: 32,
  from: 'celsius',
  to: 'fahrenheit',
}];

const rejectDownload = () => {
  vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
    throw new Error('sensitive browser download implementation detail');
  });
  return vi.spyOn(console, 'warn').mockImplementation(() => undefined);
};

afterEach(() => vi.restoreAllMocks());

describe('component export failure handling', () => {
  it('keeps failed batch CSV download details out of the UI', () => {
    const warn = rejectDownload();
    render(<BatchConverter engine={engine} settings={DEFAULT_SETTINGS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Export could not be downloaded.');
    expect(screen.getByRole('alert')).not.toHaveTextContent('sensitive browser download implementation detail');
    expect(String(warn.mock.calls[0]?.[0])).toContain('batch.export_failed');
    expect(String(warn.mock.calls[0]?.[0])).not.toContain('sensitive browser download implementation detail');
  });

  it('keeps failed history JSON download details out of the UI', () => {
    const warn = rejectDownload();
    render(<HistoryPanel history={history} settings={DEFAULT_SETTINGS} onClear={vi.fn()} onDelete={vi.fn()} onRestore={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Export could not be downloaded.');
    expect(screen.getByRole('alert')).not.toHaveTextContent('sensitive browser download implementation detail');
    expect(String(warn.mock.calls[0]?.[0])).toContain('history.export_failed');
    expect(String(warn.mock.calls[0]?.[0])).not.toContain('sensitive browser download implementation detail');
  });

  it('keeps failed full-backup download details out of the UI', () => {
    const warn = rejectDownload();
    render(
      <SettingsPanel
        settings={DEFAULT_SETTINGS}
        history={history}
        appVersion="0.2.0"
        onChange={vi.fn()}
        onRestoreData={vi.fn()}
        onResetData={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export full backup' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Backup could not be downloaded.');
    expect(screen.getByRole('alert')).not.toHaveTextContent('sensitive browser download implementation detail');
    expect(String(warn.mock.calls[0]?.[0])).toContain('backup.export_failed');
    expect(String(warn.mock.calls[0]?.[0])).not.toContain('sensitive browser download implementation detail');
  });
});
