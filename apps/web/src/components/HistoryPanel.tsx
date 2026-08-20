import { useMemo, useState } from 'react';

import { UNITS, unitById } from '../data/units';
import { en } from '../i18n/en';
import { downloadText, historyToJson } from '../lib/export';
import { formatNumber } from '../lib/format';
import { logEvent } from '../lib/logger';
import type { HistoryEntry, Settings, UnitId } from '../types';

interface Props {
  history: HistoryEntry[];
  settings: Settings;
  onClear: () => void;
  onDelete: (id: string) => void;
  onRestore: (entries: HistoryEntry[]) => void;
}

type UnitFilter = UnitId | 'all';

export function HistoryPanel({ history, settings, onClear, onDelete, onRestore }: Props) {
  const [query, setQuery] = useState('');
  const [fromFilter, setFromFilter] = useState<UnitFilter>('all');
  const [toFilter, setToFilter] = useState<UnitFilter>('all');
  const [undoEntries, setUndoEntries] = useState<HistoryEntry[]>([]);
  const [undoLabel, setUndoLabel] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return history.filter((entry) => {
      if (fromFilter !== 'all' && entry.from !== fromFilter) return false;
      if (toFilter !== 'all' && entry.to !== toFilter) return false;
      if (!normalized) return true;
      const from = unitById(entry.from);
      const to = unitById(entry.to);
      const searchable = [
        entry.input,
        entry.output,
        from.name,
        from.symbol,
        to.name,
        to.symbol,
        new Date(entry.createdAt).toLocaleString(),
      ].join(' ').toLocaleLowerCase();
      return searchable.includes(normalized);
    });
  }, [fromFilter, history, query, toFilter]);

  const rememberUndo = (entries: HistoryEntry[], label: string) => {
    setUndoEntries(entries);
    setUndoLabel(label);
  };

  const removeOne = (entry: HistoryEntry) => {
    rememberUndo([entry], en.history.removed);
    onDelete(entry.id);
  };

  const clearAll = () => {
    if (history.length === 0) return;
    rememberUndo(history, en.history.cleared(history.length));
    onClear();
  };

  const undo = () => {
    if (undoEntries.length === 0) return;
    onRestore(undoEntries);
    setUndoEntries([]);
    setUndoLabel('');
  };

  const exportHistory = () => {
    try {
      downloadText('thermoshift-history.json', historyToJson(history), 'application/json');
      setExportError(null);
    } catch (caught) {
      logEvent('warn', 'history.export_failed', { error: caught });
      setExportError(en.common.exportFailed);
    }
  };

  return (
    <section className="panel" aria-labelledby="history-title">
      <div className="panel-heading">
        <div><p className="eyebrow">{en.history.eyebrow}</p><h2 id="history-title">{en.history.title}</h2></div>
        <div className="action-row compact">
          <button type="button" onClick={exportHistory} disabled={history.length === 0}>{en.common.export}</button>
          <button className="danger-button" type="button" onClick={clearAll} disabled={history.length === 0}>{en.common.clear}</button>
        </div>
      </div>

      {exportError && <p className="error" role="alert">{exportError}</p>}

      {undoEntries.length > 0 && (
        <div className="undo-banner" role="status">
          <span>{undoLabel}</span>
          <button className="ghost-button" type="button" onClick={undo}>{en.common.undo}</button>
        </div>
      )}

      <div className="history-tools" aria-label={en.shell.historyFilters}>
        <label><span>{en.history.search}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={en.history.searchPlaceholder} /></label>
        <label><span>{en.history.from}</span><select value={fromFilter} onChange={(event) => setFromFilter(event.target.value as UnitFilter)}><option value="all">{en.common.allScales}</option>{UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
        <label><span>{en.history.to}</span><select value={toFilter} onChange={(event) => setToFilter(event.target.value as UnitFilter)}><option value="all">{en.common.allScales}</option>{UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
      </div>

      {history.length === 0 ? (
        <div className="empty-state"><strong>{en.history.emptyTitle}</strong><span>{en.history.emptyHelp}</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><strong>{en.history.noMatchesTitle}</strong><span>{en.history.noMatchesHelp}</span></div>
      ) : (
        <ol className="history-list">
          {filtered.map((entry) => (
            <li key={entry.id}>
              <div className="history-equation">
                <strong>{formatNumber(entry.input, settings.precision, settings.roundingMode)} {unitById(entry.from).symbol}</strong>
                <span>→</span>
                <strong>{formatNumber(entry.output, settings.precision, settings.roundingMode)} {unitById(entry.to).symbol}</strong>
              </div>
              <time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time>
              <button className="ghost-button history-delete" type="button" onClick={() => removeOne(entry)} aria-label={en.history.deleteLabel(unitById(entry.from).name, unitById(entry.to).name)}>{en.common.delete}</button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
