import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createBackup } from '../lib/backup';
import { DEFAULT_SETTINGS } from '../lib/storage';
import type { HistoryEntry } from '../types';
import { QuickActions } from './QuickActions';
import { SettingsPanel } from './SettingsPanel';

const history: HistoryEntry[] = [{
  id: 'restore-1',
  createdAt: '2026-08-19T00:00:00.000Z',
  input: 32,
  output: 0,
  from: 'fahrenheit',
  to: 'celsius',
}];

afterEach(() => vi.restoreAllMocks());

describe('backup restoration', () => {
  it('restores a validated JSON backup through Settings', async () => {
    const onRestoreData = vi.fn();
    const backup = createBackup({ ...DEFAULT_SETTINGS, precision: 4 }, history);
    const file = new File([backup], 'thermoshift-backup.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: async () => backup });

    render(
      <SettingsPanel
        settings={DEFAULT_SETTINGS}
        history={[]}
        onChange={vi.fn()}
        onRestoreData={onRestoreData}
        onResetData={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Restore backup'), { target: { files: [file] } });
    await waitFor(() => expect(onRestoreData).toHaveBeenCalledWith({ ...DEFAULT_SETTINGS, precision: 4 }, history));
    expect(screen.getByRole('status')).toHaveTextContent('Backup restored with 1 saved conversion.');
  });

  it('reports an invalid backup without replacing local data', async () => {
    const onRestoreData = vi.fn();
    const file = new File(['bad'], 'broken.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: async () => 'bad' });

    render(
      <SettingsPanel
        settings={DEFAULT_SETTINGS}
        history={history}
        onChange={vi.fn()}
        onRestoreData={onRestoreData}
        onResetData={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Restore backup'), { target: { files: [file] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('not valid JSON');
    expect(onRestoreData).not.toHaveBeenCalled();
  });
});

describe('quick action dialog keyboard behavior', () => {
  it('moves initial focus into the dialog and closes on Escape', async () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Trigger';
    document.body.append(trigger);
    trigger.focus();

    const onClose = vi.fn();
    render(<QuickActions open onClose={onClose} onNavigate={vi.fn()} />);

    await waitFor(() => expect(screen.getByLabelText('Search actions')).toHaveFocus());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    trigger.remove();
  });

  it('wraps Tab from the final action back to the first focusable control', () => {
    render(<QuickActions open onClose={vi.fn()} onNavigate={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    expect(first).toBeDefined();
    expect(last).toBeDefined();
    last?.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(first).toHaveFocus();
  });
});
