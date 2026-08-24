import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

vi.mock('./lib/engine', () => ({
  getTemperatureEngine: () => Promise.resolve({
    convert: (value: number, from: string, to: string) => {
      if (from === to) return value;
      if (from === 'celsius' && to === 'fahrenheit') return value * 9 / 5 + 32;
      if (from === 'fahrenheit' && to === 'celsius') return (value - 32) * 5 / 9;
      return value;
    },
    absoluteZero: () => -273.15,
    version: () => 'test',
  }),
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  it('renders the converter after loading the engine', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Convert temperature' })).toBeInTheDocument();
    expect(screen.getByText('Made by the Sanskar')).toBeInTheDocument();
  });

  it('navigates across every primary product surface', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: 'Convert temperature' });

    fireEvent.click(screen.getByRole('button', { name: /^Batch/ }));
    expect(screen.getByRole('heading', { name: 'Batch conversion' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^History/ }));
    expect(screen.getByRole('heading', { name: 'Conversion history' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Formulas/ }));
    expect(screen.getByRole('heading', { name: 'Formula guide' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Settings/ }));
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^About/ }));
    expect(screen.getByRole('heading', { name: 'About ThermoShift' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Converter/ }));
    expect(screen.getByRole('heading', { name: 'Convert temperature' })).toBeInTheDocument();
  });

  it('supports Alt-number navigation shortcuts', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: 'Convert temperature' });
    fireEvent.keyDown(window, { altKey: true, key: '5' });
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('persists a saved conversion into the history surface', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: 'Convert temperature' });

    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save to history' }));
    fireEvent.click(screen.getByRole('button', { name: /^History/ }));

    const savedRow = screen.getByRole('listitem');
    expect(savedRow).toHaveTextContent('100 °C');
    expect(savedRow).toHaveTextContent('212 °F');
  });

  it('announces offline state changes', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: 'Convert temperature' });

    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    fireEvent(window, new Event('offline'));
    expect(screen.getByRole('status')).toHaveTextContent(/offline/i);

    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    fireEvent(window, new Event('online'));
    expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
  });

  it('applies saved appearance preferences to the document root', async () => {
    localStorage.setItem('thermoshift.settings.v1', JSON.stringify({
      precision: 3,
      roundingMode: 'truncate',
      theme: 'dark',
      highContrast: true,
      reducedMotion: true,
    }));

    render(<App />);
    await screen.findByRole('heading', { name: 'Convert temperature' });
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement).toHaveClass('high-contrast', 'reduced-motion');
  });
});
