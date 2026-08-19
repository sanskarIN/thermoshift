import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import App from './App';

vi.mock('./lib/engine', () => ({
  getTemperatureEngine: async () => ({
    convert: (value: number, from: string, to: string) => from === to ? value : value + 32,
    absoluteZero: () => -273.15,
    version: () => 'test',
  }),
}));

describe('App', () => {
  it('renders the converter after loading the engine', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Convert temperature' })).toBeInTheDocument();
    expect(screen.getByText('Made by the Sanskar')).toBeInTheDocument();
  });
});
