import { useMemo, useState } from 'react';

import { UNITS, unitById } from '../data/units';
import { conversionsToCsv, downloadText } from '../lib/export';
import { formatNumber } from '../lib/format';
import type { TemperatureEngine } from '../lib/engine';
import type { ConversionResult, Settings, UnitId } from '../types';

interface Props { engine: TemperatureEngine; settings: Settings; }

export function BatchConverter({ engine, settings }: Props) {
  const [text, setText] = useState('0\n20\n37\n100');
  const [from, setFrom] = useState<UnitId>('celsius');
  const [to, setTo] = useState<UnitId>('fahrenheit');

  const { rows, errors } = useMemo(() => {
    const nextRows: ConversionResult[] = [];
    const nextErrors: string[] = [];
    text.split(/\r?\n/).forEach((line, index) => {
      if (!line.trim()) return;
      const input = Number(line.trim());
      if (!Number.isFinite(input)) {
        nextErrors.push(`Line ${index + 1}: not a finite number.`);
        return;
      }
      try {
        nextRows.push({ input, output: engine.convert(input, from, to), from, to });
      } catch (caught) {
        nextErrors.push(`Line ${index + 1}: ${caught instanceof Error ? caught.message : String(caught)}`);
      }
    });
    return { rows: nextRows, errors: nextErrors };
  }, [engine, from, text, to]);

  return (
    <section className="panel" aria-labelledby="batch-title">
      <div className="panel-heading"><div><p className="eyebrow">Many values, one pass</p><h2 id="batch-title">Batch conversion</h2></div></div>
      <div className="batch-controls">
        <label><span>From</span><select value={from} onChange={(event) => setFrom(event.target.value as UnitId)}>{UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
        <label><span>To</span><select value={to} onChange={(event) => setTo(event.target.value as UnitId)}>{UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
      </div>
      <label><span>One value per line</span><textarea rows={9} value={text} onChange={(event) => setText(event.target.value)} /></label>
      {errors.length > 0 && <div className="error-list" role="alert">{errors.map((error) => <p key={error}>{error}</p>)}</div>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Input</th><th>Output</th></tr></thead>
          <tbody>{rows.map((row, index) => <tr key={`${row.input}-${index}`}><td>{row.input} {unitById(from).symbol}</td><td>{formatNumber(row.output, settings.precision, settings.roundingMode)} {unitById(to).symbol}</td></tr>)}</tbody>
        </table>
      </div>
      <button type="button" disabled={rows.length === 0} onClick={() => downloadText('thermoshift-batch.csv', conversionsToCsv(rows), 'text/csv;charset=utf-8')}>Export CSV</button>
    </section>
  );
}
