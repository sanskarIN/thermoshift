import { useEffect, useMemo, useRef, useState } from 'react';

import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';

export type QuickActionPage = 'converter' | 'batch' | 'history' | 'formulas' | 'settings' | 'about';

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: QuickActionPage) => void;
}

const ACTIONS: ReadonlyArray<{ page: QuickActionPage; label: string; description: string; keywords: string }> = [
  { page: 'converter', label: 'Open converter', description: 'Convert a single temperature instantly.', keywords: 'convert single temperature home' },
  { page: 'batch', label: 'Open batch conversion', description: 'Convert many values and export CSV.', keywords: 'batch many csv export' },
  { page: 'history', label: 'Open history', description: 'Search, export, and manage saved conversions.', keywords: 'history saved search export' },
  { page: 'formulas', label: 'Open formula guide', description: 'Review equations and educational notes.', keywords: 'formula math learn education' },
  { page: 'settings', label: 'Open settings', description: 'Change precision, appearance, accessibility, and data options.', keywords: 'settings precision theme accessibility backup' },
  { page: 'about', label: 'Open About', description: 'View version, support, license, and project links.', keywords: 'about version support license github' },
];

export function QuickActions({ open, onClose, onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useDialogFocusTrap(dialogRef, open, inputRef, onClose);

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const matches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return ACTIONS;
    return ACTIONS.filter((action) => `${action.label} ${action.description} ${action.keywords}`.toLocaleLowerCase().includes(normalized));
  }, [query]);

  if (!open) return null;

  const select = (page: QuickActionPage) => {
    onNavigate(page);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section ref={dialogRef} className="modal-card command-card" role="dialog" aria-modal="true" aria-labelledby="quick-actions-title" tabIndex={-1}>
        <div className="panel-heading command-heading">
          <div><p className="eyebrow">Ctrl/⌘ + K</p><h2 id="quick-actions-title">Quick actions</h2></div>
          <button className="ghost-button" type="button" onClick={onClose} aria-label="Close quick actions">Esc</button>
        </div>
        <label>
          <span className="sr-only">Search actions</span>
          <input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages and actions…" autoComplete="off" />
        </label>
        {matches.length > 0 ? (
          <ul className="command-list">
            {matches.map((action) => (
              <li key={action.page}>
                <button type="button" className="command-item" onClick={() => select(action.page)}>
                  <strong>{action.label}</strong>
                  <span>{action.description}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state compact"><strong>No matching action.</strong><span>Try “history”, “settings”, or “formula”.</span></div>
        )}
      </section>
    </div>
  );
}
