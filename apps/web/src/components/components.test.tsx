import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TemperatureEngine } from '../lib/engine';
import { DEFAULT_SETTINGS } from '../lib/storage';
import type { HistoryEntry } from '../types';
import { AboutPanel } from './AboutPanel';
import { BATCH_MAX_CHARACTERS, BATCH_MAX_LINES, BatchConverter } from './BatchConverter';
import { ConverterPanel } from './ConverterPanel';
import { FormulaPanel } from './FormulaPanel';
import { HistoryPanel } from './HistoryPanel';
import { OnboardingDialog } from './OnboardingDialog';
import { QuickActions } from './QuickActions';
import { ReferenceCards } from './ReferenceCards';
import { SettingsPanel } from './SettingsPanel';

const engine: TemperatureEngine = {
  convert(value, from, to) {
    if (from === to) return value;
    if (from === 'celsius' && to === 'fahrenheit') return value * 9 / 5 + 32;
    if (from === 'celsius' && to === 'kelvin') return value + 273.15;
    if (from === 'fahrenheit' && to === 'celsius') return (value - 32) * 5 / 9;
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

describe('ConverterPanel', () => {
  it('converts, validates, and saves a result', () => {
    const onSave = vi.fn();
    render(<ConverterPanel engine={engine} settings={DEFAULT_SETTINGS} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '100' } });
    expect(screen.getByText(/212/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save to history' }));
    expect(onSave).toHaveBeenCalledWith({ input: 100, output: 212, from: 'celsius', to: 'fahrenheit' });

    fireEvent.change(screen.getByLabelText('Value'), { target: { value: 'not-a-number' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a finite number.');
    expect(screen.getByLabelText('Value')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('BatchConverter', () => {
  it('renders converted rows and reports invalid lines', () => {
    render(<BatchConverter engine={engine} settings={DEFAULT_SETTINGS} />);
    expect(screen.getByRole('heading', { name: 'Batch conversion' })).toBeInTheDocument();
    expect(screen.getByText(/32/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('One value per line'), { target: { value: '10\nbad\n20' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Line 2: not a finite number.');
  });

  it('rejects character-heavy batches before conversion work', () => {
    render(<BatchConverter engine={engine} settings={DEFAULT_SETTINGS} />);
    const input = screen.getByLabelText('One value per line');
    fireEvent.change(input, { target: { value: '1'.repeat(BATCH_MAX_CHARACTERS + 1) } });
    expect(screen.getByRole('alert')).toHaveTextContent('Batch input is limited');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
  });

  it('rejects batches above the line-count ceiling', () => {
    render(<BatchConverter engine={engine} settings={DEFAULT_SETTINGS} />);
    fireEvent.change(screen.getByLabelText('One value per line'), {
      target: { value: Array.from({ length: BATCH_MAX_LINES + 1 }, () => '1').join('\n') },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Batch input is limited');
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
  });
});

describe('ReferenceCards', () => {
  it('switches the displayed comparison scale', () => {
    render(<ReferenceCards engine={engine} settings={DEFAULT_SETTINGS} />);
    expect(screen.getByText('32.00 °F')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Show in'), { target: { value: 'kelvin' } });
    expect(screen.getByText('273.15 K')).toBeInTheDocument();
  });
});

describe('HistoryPanel', () => {
  it('filters, deletes, and restores a saved conversion', () => {
    const onDelete = vi.fn();
    const onRestore = vi.fn();
    render(<HistoryPanel history={history} settings={DEFAULT_SETTINGS} onClear={vi.fn()} onDelete={onDelete} onRestore={onRestore} />);

    fireEvent.change(screen.getByLabelText('Search history'), { target: { value: 'kelvin' } });
    expect(screen.getByText(/273.15/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Delete conversion from Celsius to Kelvin/i }));
    expect(onDelete).toHaveBeenCalledWith('history-1');
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onRestore).toHaveBeenCalledWith(history);
  });

  it('shows a distinct empty filtered state', () => {
    render(<HistoryPanel history={history} settings={DEFAULT_SETTINGS} onClear={vi.fn()} onDelete={vi.fn()} onRestore={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Search history'), { target: { value: 'rankine-only' } });
    expect(screen.getByText('No history matches these filters.')).toBeInTheDocument();
  });
});

describe('SettingsPanel', () => {
  it('clamps precision, exposes the installed version, and protects destructive reset', () => {
    const onChange = vi.fn();
    const onResetData = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<SettingsPanel settings={DEFAULT_SETTINGS} history={history} appVersion="0.2.0" onChange={onChange} onRestoreData={vi.fn()} onResetData={onResetData} />);

    expect(screen.getByText('0.2.0')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Decimal precision'), { target: { value: '99' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SETTINGS, precision: 12 });
    fireEvent.click(screen.getByRole('button', { name: 'Reset local data' }));
    expect(onResetData).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Reset local data' }));
    expect(onResetData).toHaveBeenCalledTimes(1);
  });

  it('keeps unexpected backup file-read details out of the UI', async () => {
    const onRestoreData = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const file = {
      size: 1,
      text: vi.fn().mockRejectedValue(new Error('sensitive browser file path detail')),
    } as unknown as File;

    render(<SettingsPanel settings={DEFAULT_SETTINGS} history={history} appVersion="0.2.0" onChange={vi.fn()} onRestoreData={onRestoreData} onResetData={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Restore backup'), { target: { files: [file] } });

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Backup restore failed.'));
    expect(screen.getByRole('alert')).not.toHaveTextContent('sensitive browser file path detail');
    expect(onRestoreData).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('QuickActions', () => {
  it('filters actions and navigates with a selection', () => {
    const onNavigate = vi.fn();
    const onClose = vi.fn();
    render(<QuickActions open onClose={onClose} onNavigate={onNavigate} />);
    fireEvent.change(screen.getByLabelText('Search actions'), { target: { value: 'backup' } });
    fireEvent.click(screen.getByRole('button', { name: /Open settings/i }));
    expect(onNavigate).toHaveBeenCalledWith('settings');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('OnboardingDialog', () => {
  it('offers direct conversion and settings paths', () => {
    const onComplete = vi.fn();
    const onOpenSettings = vi.fn();
    render(<OnboardingDialog onComplete={onComplete} onOpenSettings={onOpenSettings} />);
    expect(screen.getByRole('dialog', { name: /Precise conversion without an account/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Review settings first' }));
    expect(onOpenSettings).toHaveBeenCalled();
  });
});

describe('static information panels', () => {
  it('renders formulas, derivations, and project identity', () => {
    render(<FormulaPanel />);
    expect(screen.getByRole('heading', { name: 'Formula guide' })).toBeInTheDocument();
    expect(screen.getByText('°F = (°C × 9/5) + 32')).toBeInTheDocument();
    expect(screen.getAllByText('Derivation note')).toHaveLength(7);
  });

  it('renders About contacts and engine version', () => {
    render(<AboutPanel engineVersion="test-engine" />);
    expect(screen.getByText('test-engine')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub repository' })).toHaveAttribute('href', 'https://github.com/sanskarIN/thermoshift');
  });
});
