import { useMemo, useState } from 'react';

import { UNITS, unitById } from '../data/units';
import { downloadText, historyToJson } from '../lib/export';
import { formatNumber } from '../lib/format';
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
    rememberUndo([entry], 'Conversion removed.');
    onDelete(entry.id);
  };

  const clearAll = () => {
    if (history.length === 0) return;
    rememberUndo(history, `${history.length} saved conversion${history.length === 1 ? '' : 's'} cleared.`);
    onClear();
  };

  const undo = () => {
    if (undoEntries.length === 0) return;
    onRestore(undoEntries);
    setUndoEntries([]);
    setUndoLabel('');
  };

  return (
    <section className="panel" aria-labelledby="history-title">
      <div className="panel-heading">
        <div><p className="eyebrow">Stored only on this device</p><h2 id="history-title">Conversion history</h2></div>
        <div className="action-row compact">
          <button type="button" onClick={() => downloadText('thermoshift-history.json', historyToJson(history), 'application/json')} disabled={history.length === 0}>Export</button>
          <button className="danger-button" type="button" onClick={clearAll} disabled={history.length === 0}>Clear</button>
        </div>
      </div>

      {undoEntries.length > 0 && (
        <div className="undo-banner" role="status">
          <span>{undoLabel}</span>
          <button className="ghost-button" type="button" onClick={undo}>Undo</button>
        </div>
      )}

      <div className="history-tools" aria-label="History filters">
        <label><span>Search history</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Value, scale, or date…" /></label>
        <label><span>From scale</span><select value={fromFilter} onChange={(event) => setFromFilter(event.target.value as UnitFilter)}><option value="all">All scales</option>{UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
        <label><span>To scale</span><select value={toFilter} onChange={(event) => setToFilter(event.target.value as UnitFilter)}><option value="all">All scales</option>{UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
      </div>

      {history.length === 0 ? (
        <div className="empty-state"><strong>No saved conversions yet.</strong><span>Use “Save to history” from the converter.</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><strong>No history matches these filters.</strong><span>Change the search text or scale filters.</span></div>
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
              <button className="ghost-button history-delete" type="button" onClick={() => removeOne(entry)} aria-label={`Delete conversion from ${unitById(entry.from).name} to ${unitById(entry.to).name}`}>Delete</button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
