import { useEffect, useMemo, useRef, useState } from 'react';

import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';
import { en } from '../i18n/en';

export type QuickActionPage = 'converter' | 'batch' | 'history' | 'formulas' | 'settings' | 'about';

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: QuickActionPage) => void;
}

const actionCopy = en.quickActions.actions;
const ACTIONS: ReadonlyArray<{ page: QuickActionPage; label: string; description: string; keywords: string }> = [
  { page: 'converter', label: actionCopy.converter[0], description: actionCopy.converter[1], keywords: actionCopy.converter[2] },
  { page: 'batch', label: actionCopy.batch[0], description: actionCopy.batch[1], keywords: actionCopy.batch[2] },
  { page: 'history', label: actionCopy.history[0], description: actionCopy.history[1], keywords: actionCopy.history[2] },
  { page: 'formulas', label: actionCopy.formulas[0], description: actionCopy.formulas[1], keywords: actionCopy.formulas[2] },
  { page: 'settings', label: actionCopy.settings[0], description: actionCopy.settings[1], keywords: actionCopy.settings[2] },
  { page: 'about', label: actionCopy.about[0], description: actionCopy.about[1], keywords: actionCopy.about[2] },
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
          <div><p className="eyebrow">{en.quickActions.shortcut}</p><h2 id="quick-actions-title">{en.quickActions.title}</h2></div>
          <button className="ghost-button" type="button" onClick={onClose} aria-label={en.quickActions.close}>Esc</button>
        </div>
        <label>
          <span className="sr-only">{en.quickActions.searchLabel}</span>
          <input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={en.quickActions.searchPlaceholder} autoComplete="off" />
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
          <div className="empty-state compact"><strong>{en.quickActions.emptyTitle}</strong><span>{en.quickActions.emptyHelp}</span></div>
        )}
      </section>
    </div>
  );
}
