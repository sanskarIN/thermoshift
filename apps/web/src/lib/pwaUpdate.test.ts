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
    expect(getUpdateState()).toEqual({ status: 'ready' });
    markOfflineReady();
    expect(getUpdateState()).toEqual({ status: 'offline-ready' });
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  it('does not request an update while offline', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const update = vi.fn(() => Promise.resolve());
    setServiceWorkerRegistration({ update } as unknown as ServiceWorkerRegistration);

    await checkForUpdates();
    expect(update).not.toHaveBeenCalled();
    expect(getUpdateState()).toEqual({ status: 'offline' });
  });

  it('checks the registered service worker while online', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const update = vi.fn(() => Promise.resolve());
    setServiceWorkerRegistration({ update } as unknown as ServiceWorkerRegistration);

    await checkForUpdates();
    expect(update).toHaveBeenCalledOnce();
    expect(getUpdateState()).toEqual({ status: 'checked' });
  });

  it('reports update failures without throwing to the UI', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const update = vi.fn(() => Promise.reject(new Error('network failed')));
    setServiceWorkerRegistration({ update } as unknown as ServiceWorkerRegistration);

    await expect(checkForUpdates()).resolves.toBeUndefined();
    expect(getUpdateState()).toEqual({ status: 'error', errorDetail: 'network failed' });
  });

  it('reports an unavailable update service when registration is absent', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    await checkForUpdates();
    expect(getUpdateState()).toEqual({ status: 'unavailable' });
  });

  it('does not expose non-Error values as user-facing detail', () => {
    markUpdateError('unknown');
    expect(getUpdateState()).toEqual({ status: 'error', errorDetail: undefined });
  });
});
