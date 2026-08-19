import { useEffect, useMemo, useRef, useState } from 'react';

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open]);

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
      <section className="modal-card command-card" role="dialog" aria-modal="true" aria-labelledby="quick-actions-title">
        <div className="panel-heading command-heading">
          <div><p className="eyebrow">Ctrl/⌘ + K</p><h2 id="quick-actions-title">Quick actions</h2></div>
          <button className="ghost-button" type="button" onClick={onClose} aria-label="Close quick actions">Esc</button>
        </div>
        <label>
          <span className="sr-only">Search actions</span>
          <input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages and actions…" autoComplete="off" />
        </label>
        <div className="command-list" role="list">
          {matches.map((action) => (
            <button key={action.page} type="button" className="command-item" onClick={() => select(action.page)} role="listitem">
              <strong>{action.label}</strong>
              <span>{action.description}</span>
            </button>
          ))}
          {matches.length === 0 && <div className="empty-state compact"><strong>No matching action.</strong><span>Try “history”, “settings”, or “formula”.</span></div>}
        </div>
      </section>
    </div>
  );
}
