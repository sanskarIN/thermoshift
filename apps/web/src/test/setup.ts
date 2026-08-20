import '@testing-library/jest-dom/vitest';

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => window.setTimeout(() => callback(performance.now()), 0);
}

if (!globalThis.cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = (handle: number): void => window.clearTimeout(handle);
}

if (!globalThis.URL.createObjectURL) {
  globalThis.URL.createObjectURL = () => 'blob:thermoshift-test';
}

if (!globalThis.URL.revokeObjectURL) {
  globalThis.URL.revokeObjectURL = () => undefined;
}
