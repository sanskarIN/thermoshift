import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  checkForUpdates,
  getUpdateState,
  markOfflineReady,
  markUpdateError,
  resetUpdateStateForTests,
  setServiceWorkerRegistration,
  subscribeToUpdates,
} from './pwaUpdate';

afterEach(() => {
  resetUpdateStateForTests();
  vi.restoreAllMocks();
});

describe('PWA update service', () => {
  it('publishes registration and offline-ready state changes', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToUpdates(listener);
    const registration = { update: vi.fn() } as unknown as ServiceWorkerRegistration;

    setServiceWorkerRegistration(registration);
    expect(getUpdateState().status).toBe('ready');
    markOfflineReady();
    expect(getUpdateState().status).toBe('offline-ready');
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  it('does not request an update while offline', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const update = vi.fn(async () => undefined);
    setServiceWorkerRegistration({ update } as unknown as ServiceWorkerRegistration);

    await checkForUpdates();
    expect(update).not.toHaveBeenCalled();
    expect(getUpdateState().status).toBe('unavailable');
  });

  it('checks the registered service worker while online', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const update = vi.fn(async () => undefined);
    setServiceWorkerRegistration({ update } as unknown as ServiceWorkerRegistration);

    await checkForUpdates();
    expect(update).toHaveBeenCalledOnce();
    expect(getUpdateState().status).toBe('checked');
  });

  it('reports update failures without throwing to the UI', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const update = vi.fn(async () => { throw new Error('network failed'); });
    setServiceWorkerRegistration({ update } as unknown as ServiceWorkerRegistration);

    await expect(checkForUpdates()).resolves.toBeUndefined();
    expect(getUpdateState()).toEqual({ status: 'error', message: 'Update service error: network failed' });
  });

  it('reports an unavailable update service when registration is absent', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    await checkForUpdates();
    expect(getUpdateState().status).toBe('unavailable');
  });

  it('normalizes non-Error registration failures', () => {
    markUpdateError('unknown');
    expect(getUpdateState()).toEqual({ status: 'error', message: 'Update service encountered an unknown error.' });
  });
});
