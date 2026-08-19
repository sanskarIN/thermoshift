import { useSyncExternalStore } from 'react';

import { en } from '../i18n/en';
import { checkForUpdates, getUpdateState, subscribeToUpdates, type UpdateState } from '../lib/pwaUpdate';

interface Props {
  version: string;
}

const updateMessage = (update: UpdateState): string => {
  const copy = en.settings.updateStatus;
  switch (update.status) {
    case 'initializing': return copy.initializing;
    case 'ready': return copy.ready;
    case 'checking': return copy.checking;
    case 'checked': return copy.checked;
    case 'offline-ready': return copy.offlineReady;
    case 'offline': return copy.offline;
    case 'unavailable': return copy.unavailable;
    case 'error': return update.errorDetail ? `${copy.error} ${update.errorDetail}` : copy.error;
  }
};

export function UpdatePanel({ version }: Props) {
  const update = useSyncExternalStore(subscribeToUpdates, getUpdateState, getUpdateState);
  const checking = update.status === 'checking';

  return (
    <div className="settings-section" aria-labelledby="updates-title">
      <h3 id="updates-title">{en.settings.updates}</h3>
      <p><strong>{en.settings.installedVersion}:</strong> {version}</p>
      <p className="helper">{en.settings.updateHelp}</p>
      <div className="action-row">
        <button type="button" onClick={() => void checkForUpdates()} disabled={checking}>
          {checking ? en.settings.updateStatus.checking : en.settings.checkForUpdates}
        </button>
      </div>
      <p className={update.status === 'error' ? 'error' : 'helper'} role={update.status === 'error' ? 'alert' : 'status'}>{updateMessage(update)}</p>
    </div>
  );
}
