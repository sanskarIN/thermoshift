import { unitById } from '../data/units';
import { downloadText, historyToJson } from '../lib/export';
import { formatNumber } from '../lib/format';
import type { HistoryEntry, Settings } from '../types';

interface Props {
  history: HistoryEntry[];
  settings: Settings;
  onClear: () => void;
}

export function HistoryPanel({ history, settings, onClear }: Props) {
  return (
    <section className="panel" aria-labelledby="history-title">
      <div className="panel-heading">
        <div><p className="eyebrow">Stored only on this device</p><h2 id="history-title">Conversion history</h2></div>
        <div className="action-row compact">
          <button type="button" onClick={() => downloadText('thermoshift-history.json', historyToJson(history), 'application/json')} disabled={history.length === 0}>Export</button>
          <button className="danger-button" type="button" onClick={onClear} disabled={history.length === 0}>Clear</button>
        </div>
      </div>
      {history.length === 0 ? (
        <div className="empty-state"><strong>No saved conversions yet.</strong><span>Use “Save to history” from the converter.</span></div>
      ) : (
        <ol className="history-list">
          {history.map((entry) => (
            <li key={entry.id}>
              <strong>{formatNumber(entry.input, settings.precision, settings.roundingMode)} {unitById(entry.from).symbol}</strong>
              <span>→</span>
              <strong>{formatNumber(entry.output, settings.precision, settings.roundingMode)} {unitById(entry.to).symbol}</strong>
              <time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
