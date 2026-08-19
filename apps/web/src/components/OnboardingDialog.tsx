import { useRef } from 'react';

import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';
import { en } from '../i18n/en';

interface Props {
  onComplete: () => void;
  onOpenSettings: () => void;
}

export function OnboardingDialog({ onComplete, onOpenSettings }: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const primaryButton = useRef<HTMLButtonElement>(null);
  useDialogFocusTrap(dialogRef, true, primaryButton);

  return (
    <div className="modal-backdrop" role="presentation">
      <section ref={dialogRef} className="modal-card onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-description" tabIndex={-1}>
        <img src="/logo.svg" width="72" height="72" alt="" />
        <p className="eyebrow">{en.onboarding.eyebrow}</p>
        <h1 id="onboarding-title">{en.onboarding.title}</h1>
        <p id="onboarding-description" className="lead">{en.onboarding.description}</p>

        <div className="onboarding-grid">
          {en.onboarding.features.map(([title, description]) => (
            <article key={title}><strong>{title}</strong><span>{description}</span></article>
          ))}
        </div>

        <div className="action-row modal-actions">
          <button ref={primaryButton} type="button" onClick={onComplete}>{en.onboarding.start}</button>
          <button className="ghost-button" type="button" onClick={onOpenSettings}>{en.onboarding.settings}</button>
        </div>
      </section>
    </div>
  );
}
