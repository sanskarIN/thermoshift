import { logEvent } from './logger';

export type UpdateStatus = 'initializing' | 'ready' | 'checking' | 'checked' | 'offline-ready' | 'offline' | 'unavailable' | 'error';

export interface UpdateState {
  status: UpdateStatus;
  errorDetail?: string;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let registration: ServiceWorkerRegistration | undefined;
let state: UpdateState = { status: 'initializing' };

const emit = (next: UpdateState) => {
  state = next;
  for (const listener of listeners) listener();
};

export const getUpdateState = (): UpdateState => state;

export const subscribeToUpdates = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setServiceWorkerRegistration = (nextRegistration: ServiceWorkerRegistration | undefined): void => {
  registration = nextRegistration;
  emit({ status: nextRegistration ? 'ready' : 'unavailable' });
};

export const markOfflineReady = (): void => {
  emit({ status: 'offline-ready' });
};

export const markUpdateError = (error: unknown): void => {
  logEvent('warn', 'pwa.update_failed', { error });
  emit({
    status: 'error',
    errorDetail: error instanceof Error ? error.message : undefined,
  });
};

export const checkForUpdates = async (): Promise<void> => {
  if (!navigator.onLine) {
    emit({ status: 'offline' });
    return;
  }

  if (!registration) {
    emit({ status: 'unavailable' });
    return;
  }

  emit({ status: 'checking' });
  try {
    await registration.update();
    emit({ status: 'checked' });
  } catch (error) {
    markUpdateError(error);
  }
};

export const resetUpdateStateForTests = (): void => {
  registration = undefined;
  state = { status: 'initializing' };
  listeners.clear();
};
