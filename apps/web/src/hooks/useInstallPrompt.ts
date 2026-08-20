import { useCallback, useEffect, useMemo, useState } from 'react';

type InstallOutcome = 'accepted' | 'dismissed';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome; platform: string }>;
}

function isStandaloneDisplayMode(): boolean {
  const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return displayModeStandalone || iosStandalone;
}

export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent>();
  const [installed, setInstalled] = useState(isStandaloneDisplayMode);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setPromptEvent(undefined);
    };

    addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    addEventListener('appinstalled', handleInstalled);

    return () => {
      removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return false;

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setPromptEvent(undefined);
      return true;
    }
    return false;
  }, [promptEvent]);

  return useMemo(
    () => ({
      canInstall: !installed && Boolean(promptEvent),
      installed,
      install,
    }),
    [install, installed, promptEvent],
  );
}
