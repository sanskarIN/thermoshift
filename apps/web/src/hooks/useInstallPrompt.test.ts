import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { type BeforeInstallPromptEvent, useInstallPrompt } from './useInstallPrompt';

function installPromptEvent(outcome: 'accepted' | 'dismissed' = 'accepted') {
  const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
  const prompt = vi.fn().mockResolvedValue(undefined);
  Object.assign(event, {
    prompt,
    userChoice: Promise.resolve({ outcome, platform: 'web' }),
  });
  return { event, prompt };
}

describe('useInstallPrompt', () => {
  it('captures the browser install prompt and clears it after acceptance', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const { event, prompt } = installPromptEvent();

    await act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.canInstall).toBe(true);

    await act(async () => {
      expect(await result.current.install()).toBe(true);
    });

    expect(prompt).toHaveBeenCalledOnce();
    expect(result.current.canInstall).toBe(false);
  });

  it('keeps installation available when the user dismisses the prompt', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const { event } = installPromptEvent('dismissed');

    await act(() => {
      window.dispatchEvent(event);
    });

    await act(async () => {
      expect(await result.current.install()).toBe(false);
    });

    expect(result.current.canInstall).toBe(true);
  });

  it('marks the app installed when the browser emits appinstalled', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const { event } = installPromptEvent();

    await act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.canInstall).toBe(true);

    await act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(result.current.installed).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });
});
