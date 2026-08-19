export type UpdateStatus = 'initializing' | 'ready' | 'checking' | 'checked' | 'offline-ready' | 'unavailable' | 'error';

export interface UpdateState {
  status: UpdateStatus;
  message: string;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let registration: ServiceWorkerRegistration | undefined;
let state: UpdateState = {
  status: 'initializing',
  message: 'Update service is starting…',
};

const emit = (next: UpdateState) => {
  state = next;
  for (const listener of listeners) listener();
};

export const getUpdateState = (): UpdateState => state;

export const subscribeToUpdates = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setServiceWorkerRegistration = (nextRegistration: ServiceWorkerRegistration | undefined): void => {
  registration = nextRegistration;
  emit(nextRegistration
    ? { status: 'ready', message: 'Automatic updates are enabled.' }
    : { status: 'unavailable', message: 'Update service is not available in this session.' });
};

export const markOfflineReady = (): void => {
  emit({ status: 'offline-ready', message: 'ThermoShift is ready to work offline.' });
};

export const markUpdateError = (error: unknown): void => {
  emit({
    status: 'error',
    message: error instanceof Error ? `Update service error: ${error.message}` : 'Update service encountered an unknown error.',
  });
};

export const checkForUpdates = async (): Promise<void> => {
  if (!navigator.onLine) {
    emit({ status: 'unavailable', message: 'Connect to the internet to check for a new app version.' });
    return;
  }

  if (!registration) {
    emit({ status: 'unavailable', message: 'Update service is not available in this session.' });
    return;
  }

  emit({ status: 'checking', message: 'Checking for an updated app…' });
  try {
    await registration.update();
    emit({
      status: 'checked',
      message: 'Update check completed. If a new version is available, ThermoShift will apply it automatically.',
    });
  } catch (error) {
    markUpdateError(error);
  }
};

export const resetUpdateStateForTests = (): void => {
  registration = undefined;
  state = { status: 'initializing', message: 'Update service is starting…' };
  listeners.clear();
};
