import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TemperatureEngine } from '../lib/engine';
import { DEFAULT_SETTINGS } from '../lib/storage';
import { ConverterPanel } from './ConverterPanel';

const engine: TemperatureEngine = {
  convert(value, from, to) {
    if (from === to) return value;
    if (from === 'celsius' && to === 'fahrenheit') return value * 9 / 5 + 32;
    return value;
  },
  absoluteZero: () => -273.15,
  version: () => 'test-engine',
};

const setNavigatorProperty = (name: 'clipboard' | 'share', value: unknown) => {
  Object.defineProperty(navigator, name, { configurable: true, value });
};

const renderConverter = () => render(<ConverterPanel engine={engine} settings={DEFAULT_SETTINGS} onSave={vi.fn()} />);

afterEach(() => {
  delete (navigator as Navigator & { clipboard?: Clipboard }).clipboard;
  delete (navigator as Navigator & { share?: Navigator['share'] }).share;
  vi.restoreAllMocks();
});

describe('ConverterPanel clipboard and share behavior', () => {
  it('copies the formatted result through the clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigatorProperty('clipboard', { writeText });
    renderConverter();

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('32.00 °F'));
    expect(screen.getByRole('status')).toHaveTextContent('Result copied.');
  });

  it('reports unavailable clipboard support without throwing', () => {
    setNavigatorProperty('clipboard', undefined);
    renderConverter();

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(screen.getByRole('status')).toHaveTextContent('Clipboard access is not available in this browser.');
  });

  it('keeps rejected clipboard error details out of the UI and redacted log record', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('sensitive clipboard implementation detail'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    setNavigatorProperty('clipboard', { writeText });
    renderConverter();

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copy failed.'));
    expect(screen.getByRole('status')).not.toHaveTextContent('sensitive clipboard implementation detail');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain('clipboard.write_failed');
    expect(String(warn.mock.calls[0]?.[0])).not.toContain('sensitive clipboard implementation detail');
  });

  it('uses native share when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setNavigatorProperty('share', share);
    renderConverter();

    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => expect(share).toHaveBeenCalledWith({ title: 'ThermoShift conversion', text: '0 °C = 32.00 °F' }));
    expect(screen.getByRole('status')).toHaveTextContent('Conversion shared.');
  });

  it('treats native share cancellation as a user cancellation rather than a failure', async () => {
    const share = vi.fn().mockRejectedValue({ name: 'AbortError' });
    setNavigatorProperty('share', share);
    renderConverter();

    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('keeps rejected native-share details out of the UI', async () => {
    const share = vi.fn().mockRejectedValue(new Error('sensitive native share detail'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    setNavigatorProperty('share', share);
    renderConverter();

    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Share failed.'));
    expect(screen.getByRole('status')).not.toHaveTextContent('sensitive native share detail');
    expect(String(warn.mock.calls[0]?.[0])).toContain('share.failed');
    expect(String(warn.mock.calls[0]?.[0])).not.toContain('sensitive native share detail');
  });

  it('falls back to clipboard sharing and keeps fallback failures generic', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('sensitive fallback detail'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    setNavigatorProperty('share', undefined);
    setNavigatorProperty('clipboard', { writeText });
    renderConverter();

    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Share failed.'));
    expect(writeText).toHaveBeenCalledWith('0 °C = 32.00 °F');
    expect(screen.getByRole('status')).not.toHaveTextContent('sensitive fallback detail');
    expect(String(warn.mock.calls[0]?.[0])).toContain('share.fallback_copy_failed');
    expect(String(warn.mock.calls[0]?.[0])).not.toContain('sensitive fallback detail');
  });
});
