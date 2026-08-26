import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TemperatureEngine } from '../lib/engine';
import { DEFAULT_SETTINGS } from '../lib/storage';
import type { HistoryEntry } from '../types';
import { AboutPanel } from './AboutPanel';
import { BatchConverter } from './BatchConverter';
import { ConverterPanel } from './ConverterPanel';
import { FormulaPanel } from './FormulaPanel';
import { HistoryPanel } from './HistoryPanel';
import { ReferenceCards } from './ReferenceCards';
import { SettingsPanel } from './SettingsPanel';

const engine: TemperatureEngine = {
  convert(value, from, to) {
    if (value === -999) throw new Error('Temperature is below absolute zero.');
    if (from === to) return value;
    if (from === 'celsius' && to === 'fahrenheit') return value * 9 / 5 + 32;
    if (from === 'fahrenheit' && to === 'celsius') return (value - 32) * 5 / 9;
    if (from === 'celsius' && to === 'kelvin') return value + 273.15;
    return value;
  },
  absoluteZero: () => -273.15,
  version: () => 'test-engine',
};

const history: HistoryEntry[] = [{
  id: 'history-1',
  createdAt: '2026-08-19T00:00:00.000Z',
  input: 0,
  output: 273.15,
  from: 'celsius',
  to: 'kelvin',
}];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ConverterPanel', () => {
  it('converts, validates, rejects physical errors, and saves a result', () => {
    const onSave = vi.fn();
    render(<ConverterPanel engine={engine} settings={DEFAULT_SETTINGS} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '100' } });
    expect(screen.getByText('212')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save to history' }));
    expect(onSave).toHaveBeenCalledWith({ input: 100, output: 212, from: 'celsius', to: 'fahrenheit' });

    fireEvent.change(screen.getByLabelText('Value'), { target: { value: 'not-a-number' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a finite number.');
    expect(screen.getByRole('button', { name: 'Save to history' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '-999' } });
    expect(screen.getByRole('alert')).toHaveTextContent('below absolute zero');

    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('swaps units and reuses the current converted value', () => {
    render(<ConverterPanel engine={engine} settings={DEFAULT_SETTINGS} onSave={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Swap source and destination units' }));

    expect(screen.getByLabelText('From')).toHaveValue('fahrenheit');
    expect(screen.getByLabelText('To')).toHaveValue('celsius');
    expect(screen.getByLabelText('Value')).toHaveValue('212');
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('copies and shares the current result through browser capabilities', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });

    render(<ConverterPanel engine={engine} settings={DEFAULT_SETTINGS} onSave={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Result copied.'));
    expect(writeText).toHaveBeenCalledWith('32 °F');

    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Share sheet opened.'));
    expect(share).toHaveBeenCalledWith({ title: 'ThermoShift conversion', text: '0 °C = 32 °F' });
  });

  it('reports clipboard failures without breaking conversion', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });

    render(<ConverterPanel engine={engine} settings={DEFAULT_SETTINGS} onSave={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Clipboard access is not available'));

    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Clipboard access is not available'));
  });
});

describe('BatchConverter', () => {
  it('renders rows, switches units, and reports invalid or rejected lines', () => {
    render(<BatchConverter engine={engine} settings={DEFAULT_SETTINGS} />);
    expect(screen.getByRole('heading', { name: 'Batch conversion' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('One value per line'), { target: { value: '10\nbad\n-999\n20\n' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Line 2: not a finite number.');
    expect(screen.getByRole('alert')).toHaveTextContent('Line 3: Temperature is below absolute zero.');

    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'fahrenheit' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'celsius' } });
    expect(screen.getByLabelText('From')).toHaveValue('fahrenheit');
    expect(screen.getByLabelText('To')).toHaveValue('celsius');
  });
});

describe('HistoryPanel', () => {
  it('renders an empty state', () => {
    render(<HistoryPanel history={[]} settings={DEFAULT_SETTINGS} onClear={vi.fn()} />);
    expect(screen.getByText('No saved conversions yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled();
  });

  it('renders saved history and clears it', () => {
    const onClear = vi.fn();
    render(<HistoryPanel history={history} settings={DEFAULT_SETTINGS} onClear={onClear} />);
    expect(screen.getByText('273.15 K')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});

describe('SettingsPanel', () => {
  it('patches conversion and accessibility settings and resets local data', () => {
    const onChange = vi.fn();
    const onResetData = vi.fn();
    render(<SettingsPanel settings={DEFAULT_SETTINGS} onChange={onChange} onResetData={onResetData} />);

    fireEvent.change(screen.getByLabelText('Decimal precision'), { target: { value: '99' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SETTINGS, precision: 12 });

    fireEvent.change(screen.getByLabelText('Rounding'), { target: { value: 'truncate' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SETTINGS, roundingMode: 'truncate' });

    fireEvent.change(screen.getByLabelText('Theme'), { target: { value: 'dark' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SETTINGS, theme: 'dark' });

    fireEvent.click(screen.getByLabelText('High contrast'));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SETTINGS, highContrast: true });

    fireEvent.click(screen.getByLabelText('Reduce motion'));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SETTINGS, reducedMotion: true });

    fireEvent.click(screen.getByRole('button', { name: 'Reset local data' }));
    expect(onResetData).toHaveBeenCalledOnce();
  });
});

describe('informational panels', () => {
  it('renders reference points through the canonical engine', () => {
    render(<ReferenceCards engine={engine} settings={DEFAULT_SETTINGS} unit="celsius" />);
    expect(screen.getByRole('heading', { name: 'Reference points' })).toBeInTheDocument();
    const freezingCard = screen.getByText('Water freezes').closest('article');
    expect(freezingCard).toHaveTextContent('0 °C');
  });

  it('renders formula education', () => {
    render(<FormulaPanel />);
    expect(screen.getByRole('heading', { name: 'Formula guide' })).toBeInTheDocument();
    expect(screen.getByText('°F = (°C × 9/5) + 32')).toBeInTheDocument();
    expect(screen.getByText(/Delisle is reversed/)).toBeInTheDocument();
  });

  it('renders project identity, support links, and engine version', () => {
    render(<AboutPanel engineVersion="test-engine" />);
    expect(screen.getByText('test-engine')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub repository' })).toHaveAttribute('href', 'https://github.com/sanskarIN/thermoshift');
    expect(screen.getByRole('link', { name: 'Buy Me a Coffee' })).toHaveAttribute('href', 'https://buymeacoffee.com/sanskarIN');
  });
});
