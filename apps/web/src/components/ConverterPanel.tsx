import { useEffect, useMemo, useState } from 'react';

import { UNITS, unitById } from '../data/units';
import { formatNumber } from '../lib/format';
import type { TemperatureEngine } from '../lib/engine';
import type { ConversionResult, Settings, UnitId } from '../types';

interface Props {
  engine: TemperatureEngine;
  settings: Settings;
  onSave: (result: ConversionResult) => void;
}

export function ConverterPanel({ engine, settings, onSave }: Props) {
  const [input, setInput] = useState('0');
  const [from, setFrom] = useState<UnitId>('celsius');
  const [to, setTo] = useState<UnitId>('fahrenheit');
  const [result, setResult] = useState<number | null>(32);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const parsed = Number(input);
    if (input.trim() === '' || !Number.isFinite(parsed)) {
      setResult(null);
      setError(input.trim() === '' ? null : 'Enter a finite number.');
      return;
    }
    try {
      setResult(engine.convert(parsed, from, to));
      setError(null);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }, [engine, from, input, to]);

  const absoluteZero = useMemo(() => engine.absoluteZero(from), [engine, from]);
  const formatted = result === null ? '—' : formatNumber(result, settings.precision, settings.roundingMode);

  const swap = () => {
    setFrom(to);
    setTo(from);
    if (result !== null) setInput(String(result));
  };

  const copyText = async (text: string) => {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is not available in this browser.');
    await navigator.clipboard.writeText(text);
  };

  const copy = async () => {
    if (result === null) return;
    try {
      await copyText(`${formatted} ${unitById(to).symbol}`);
      setNotice('Result copied.');
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'Copy failed.');
    }
  };

  const share = async () => {
    if (result === null) return;
    const text = `${input} ${unitById(from).symbol} = ${formatted} ${unitById(to).symbol}`;
    const canShare = typeof navigator.share === 'function';
    try {
      if (canShare) await navigator.share({ title: 'ThermoShift conversion', text });
      else await copyText(text);
      setNotice(canShare ? 'Share sheet opened.' : 'Share text copied.');
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'Share failed.');
    }
  };

  return (
    <section className="panel hero-panel" aria-labelledby="converter-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Instant conversion</p>
          <h2 id="converter-title">Convert temperature</h2>
        </div>
        <button className="ghost-button" type="button" onClick={swap} aria-label="Swap source and destination units">⇄ Swap</button>
      </div>

      <div className="converter-grid">
        <label>
          <span>Value</span>
          <input
            autoFocus
            inputMode="decimal"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            aria-describedby="absolute-zero-note conversion-error"
          />
        </label>
        <label>
          <span>From</span>
          <select value={from} onChange={(event) => setFrom(event.target.value as UnitId)}>
            {UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>)}
          </select>
        </label>
        <label>
          <span>To</span>
          <select value={to} onChange={(event) => setTo(event.target.value as UnitId)}>
            {UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>)}
          </select>
        </label>
      </div>

      <p id="absolute-zero-note" className="helper">Absolute zero: {formatNumber(absoluteZero, 4, 'half-up')} {unitById(from).symbol}</p>
      {error && <p id="conversion-error" className="error" role="alert">{error}</p>}
      {notice && <p className="helper" role="status">{notice}</p>}

      <div className="result-card" aria-live="polite">
        <span>Result</span>
        <strong>{formatted} <small>{unitById(to).symbol}</small></strong>
      </div>

      <div className="action-row">
        <button type="button" onClick={() => void copy()} disabled={result === null}>Copy</button>
        <button type="button" onClick={() => void share()} disabled={result === null}>Share</button>
        <button
          type="button"
          onClick={() => {
            const parsed = Number(input);
            if (result !== null && Number.isFinite(parsed)) onSave({ input: parsed, output: result, from, to });
          }}
          disabled={result === null}
        >Save to history</button>
      </div>
    </section>
  );
}
