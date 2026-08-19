import { useSyncExternalStore } from 'react';

import { en } from '../i18n/en';
import { checkForUpdates, getUpdateState, subscribeToUpdates } from '../lib/pwaUpdate';

interface Props {
  version: string;
}

export function UpdatePanel({ version }: Props) {
  const update = useSyncExternalStore(subscribeToUpdates, getUpdateState, getUpdateState);

  return (
    <div className="settings-section" aria-labelledby="updates-title">
      <h3 id="updates-title">{en.settings.updates}</h3>
      <p><strong>{en.settings.installedVersion}:</strong> {version}</p>
      <p className="helper">{en.settings.updateHelp}</p>
      <div className="action-row">
        <button type="button" onClick={() => void checkForUpdates()} disabled={update.status === 'checking'}>
          {update.status === 'checking' ? 'Checking…' : en.settings.checkForUpdates}
        </button>
      </div>
      <p className={update.status === 'error' ? 'error' : 'helper'} role={update.status === 'error' ? 'alert' : 'status'}>{update.message}</p>
    </div>
  );
}
