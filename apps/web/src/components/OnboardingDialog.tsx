import { useRef } from 'react';

import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';

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
        <p className="eyebrow">Welcome to ThermoShift</p>
        <h1 id="onboarding-title">Precise conversion without an account</h1>
        <p id="onboarding-description" className="lead">Everything runs locally on your device. Start converting immediately, then customize precision, theme, and accessibility whenever you want.</p>

        <div className="onboarding-grid">
          <article><strong>8 temperature scales</strong><span>Modern and educational scales share one validated Rust engine.</span></article>
          <article><strong>Offline-first</strong><span>Install the PWA and keep converting without a network connection.</span></article>
          <article><strong>Your data stays local</strong><span>History and preferences remain in browser-managed storage until you export or clear them.</span></article>
        </div>

        <div className="action-row modal-actions">
          <button ref={primaryButton} type="button" onClick={onComplete}>Start converting</button>
          <button className="ghost-button" type="button" onClick={onOpenSettings}>Review settings first</button>
        </div>
      </section>
    </div>
  );
}
