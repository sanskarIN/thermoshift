import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { resetUpdateStateForTests, setServiceWorkerRegistration } from '../lib/pwaUpdate';
import { UpdatePanel } from './UpdatePanel';

afterEach(() => {
  resetUpdateStateForTests();
  vi.restoreAllMocks();
});

describe('UpdatePanel', () => {
  it('shows the installed version and ready state', () => {
    setServiceWorkerRegistration({ update: vi.fn() } as unknown as ServiceWorkerRegistration);
    render(<UpdatePanel version="0.2.0" />);
    expect(screen.getByText('0.2.0')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Automatic updates are enabled.');
  });

  it('reports offline checks without calling the service worker', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const update = vi.fn(() => Promise.resolve());
    setServiceWorkerRegistration({ update } as unknown as ServiceWorkerRegistration);
    render(<UpdatePanel version="0.2.0" />);

    fireEvent.click(screen.getByRole('button', { name: 'Check for updates' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Connect to the internet'));
    expect(update).not.toHaveBeenCalled();
  });

  it('announces a completed online update check', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const update = vi.fn(() => Promise.resolve());
    setServiceWorkerRegistration({ update } as unknown as ServiceWorkerRegistration);
    render(<UpdatePanel version="0.2.0" />);

    fireEvent.click(screen.getByRole('button', { name: 'Check for updates' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Update check completed'));
    expect(update).toHaveBeenCalledOnce();
  });

  it('announces service-worker failures without exposing raw error detail', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const update = vi.fn(() => Promise.reject(new Error('sensitive network detail')));
    setServiceWorkerRegistration({ update } as unknown as ServiceWorkerRegistration);
    render(<UpdatePanel version="0.2.0" />);

    fireEvent.click(screen.getByRole('button', { name: 'Check for updates' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Update service error.');
    expect(alert).not.toHaveTextContent('sensitive network detail');
  });
});
