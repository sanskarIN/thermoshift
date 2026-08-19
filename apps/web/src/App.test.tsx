import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { ONBOARDING_KEY } from './lib/storage';

const engineControl = vi.hoisted(() => ({ fail: false }));

vi.mock('./lib/engine', () => ({
  getTemperatureEngine: async () => {
    if (engineControl.fail) throw new Error('sensitive initialization detail');
    return {
      convert: (value: number, from: string, to: string) => from === to ? value : value + 32,
      absoluteZero: () => -273.15,
      version: () => 'test',
    };
  },
}));

describe('App', () => {
  beforeEach(() => {
    engineControl.fail = false;
    localStorage.clear();
    localStorage.setItem(ONBOARDING_KEY, 'complete');
  });

  it('renders the converter after loading the engine', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Convert temperature' })).toBeInTheDocument();
    expect(screen.getByText('Made by the Sanskar')).toBeInTheDocument();
  });

  it('shows a generic startup failure without exposing raw initialization details', async () => {
    engineControl.fail = true;
    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('ThermoShift could not start');
    expect(alert).toHaveTextContent('Reload the app');
    expect(alert).not.toHaveTextContent('sensitive initialization detail');
  });

  it('supports Alt page shortcuts outside editable controls', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: 'Convert temperature' });
    fireEvent.keyDown(window, { altKey: true, key: '5' });
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('does not steal Alt page shortcuts while a form control is being edited', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: 'Convert temperature' });
    const value = screen.getByLabelText('Value');
    value.focus();

    fireEvent.keyDown(value, { altKey: true, key: '5' });
    expect(screen.getByRole('heading', { name: 'Convert temperature' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('opens quick actions with Ctrl+K and navigates', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: 'Convert temperature' });
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' });
    expect(screen.getByRole('dialog', { name: 'Quick actions' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Open formula guide/i }));
    expect(screen.getByRole('heading', { name: 'Formula guide' })).toBeInTheDocument();
  });

  it('keeps the command-palette shortcut global while focus is inside an input', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: 'Convert temperature' });
    const value = screen.getByLabelText('Value');
    value.focus();

    fireEvent.keyDown(value, { ctrlKey: true, key: 'k' });
    expect(screen.getByRole('dialog', { name: 'Quick actions' })).toBeInTheDocument();
  });

  it('does not open Quick Actions behind first-run onboarding', async () => {
    localStorage.removeItem(ONBOARDING_KEY);
    render(<App />);
    await screen.findByRole('heading', { name: 'Convert temperature' });
    expect(screen.getByRole('dialog', { name: /Precise conversion without an account/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' });
    expect(screen.queryByRole('dialog', { name: 'Quick actions' })).not.toBeInTheDocument();
  });

  it('does not navigate the background page while Quick Actions is open', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: 'Convert temperature' });
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' });
    expect(screen.getByRole('dialog', { name: 'Quick actions' })).toBeInTheDocument();

    fireEvent.keyDown(window, { altKey: true, key: '5' });
    expect(screen.getByRole('heading', { name: 'Convert temperature' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('shows onboarding on a clean first run', async () => {
    localStorage.removeItem(ONBOARDING_KEY);
    render(<App />);
    await screen.findByRole('heading', { name: 'Convert temperature' });
    expect(screen.getByRole('dialog', { name: /Precise conversion without an account/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start converting' }));
    expect(screen.queryByRole('dialog', { name: /Precise conversion without an account/i })).not.toBeInTheDocument();
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('complete');
  });
});
