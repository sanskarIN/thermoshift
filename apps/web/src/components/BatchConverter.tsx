import { useMemo, useState } from 'react';

import { UNITS, unitById } from '../data/units';
import { en } from '../i18n/en';
import { conversionsToCsv, downloadText } from '../lib/export';
import { formatNumber } from '../lib/format';
import type { TemperatureEngine } from '../lib/engine';
import type { ConversionResult, Settings, UnitId } from '../types';

interface Props { engine: TemperatureEngine; settings: Settings; }

export const BATCH_MAX_CHARACTERS = 32_768;
export const BATCH_MAX_LINES = 1_000;

export function BatchConverter({ engine, settings }: Props) {
  const [text, setText] = useState('0\n20\n37\n100');
  const [from, setFrom] = useState<UnitId>('celsius');
  const [to, setTo] = useState<UnitId>('fahrenheit');

  const { rows, errors, exceedsLimit } = useMemo(() => {
    if (text.length > BATCH_MAX_CHARACTERS) {
      return {
        rows: [] as ConversionResult[],
        errors: [en.batch.tooManyCharacters(BATCH_MAX_CHARACTERS)],
        exceedsLimit: true,
      };
    }

    const lines = text.split(/\r?\n/);
    if (lines.length > BATCH_MAX_LINES) {
      return {
        rows: [] as ConversionResult[],
        errors: [en.batch.tooManyLines(BATCH_MAX_LINES)],
        exceedsLimit: true,
      };
    }

    const nextRows: ConversionResult[] = [];
    const nextErrors: string[] = [];
    lines.forEach((line, index) => {
      if (!line.trim()) return;
      const input = Number(line.trim());
      if (!Number.isFinite(input)) {
        nextErrors.push(en.batch.lineNotFinite(index + 1));
        return;
      }
      try {
        nextRows.push({ input, output: engine.convert(input, from, to), from, to });
      } catch (caught) {
        nextErrors.push(en.batch.lineError(index + 1, caught instanceof Error ? caught.message : String(caught)));
      }
    });
    return { rows: nextRows, errors: nextErrors, exceedsLimit: false };
  }, [engine, from, text, to]);

  return (
    <section className="panel" aria-labelledby="batch-title">
      <div className="panel-heading"><div><p className="eyebrow">{en.batch.eyebrow}</p><h2 id="batch-title">{en.batch.title}</h2></div></div>
      <div className="batch-controls">
        <label><span>{en.batch.from}</span><select value={from} onChange={(event) => setFrom(event.target.value as UnitId)}>{UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
        <label><span>{en.batch.to}</span><select value={to} onChange={(event) => setTo(event.target.value as UnitId)}>{UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
      </div>
      <label>
        <span>{en.batch.values}</span>
        <textarea
          rows={9}
          value={text}
          aria-describedby="batch-input-limits"
          aria-invalid={exceedsLimit || undefined}
          onChange={(event) => setText(event.target.value)}
        />
      </label>
      <p id="batch-input-limits" className="field-help">{en.batch.limitsHelp(BATCH_MAX_LINES, BATCH_MAX_CHARACTERS)}</p>
      {errors.length > 0 && <div className="error-list" role="alert">{errors.map((error) => <p key={error}>{error}</p>)}</div>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>{en.batch.input}</th><th>{en.batch.output}</th></tr></thead>
          <tbody>{rows.map((row, index) => <tr key={`${row.input}-${index}`}><td>{row.input} {unitById(from).symbol}</td><td>{formatNumber(row.output, settings.precision, settings.roundingMode)} {unitById(to).symbol}</td></tr>)}</tbody>
        </table>
      </div>
      <button type="button" disabled={rows.length === 0 || exceedsLimit} onClick={() => downloadText('thermoshift-batch.csv', conversionsToCsv(rows), 'text/csv;charset=utf-8')}>{en.batch.export}</button>
    </section>
  );
}
