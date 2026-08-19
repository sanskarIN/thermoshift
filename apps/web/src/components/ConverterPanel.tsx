import { useEffect, useMemo, useState } from 'react';

import { UNITS, unitById } from '../data/units';
import { en } from '../i18n/en';
import { formatNumber } from '../lib/format';
import type { TemperatureEngine } from '../lib/engine';
import { logEvent } from '../lib/logger';
import type { ConversionResult, Settings, UnitId } from '../types';

interface Props {
  engine: TemperatureEngine;
  settings: Settings;
  onSave: (result: ConversionResult) => void;
}

const hasErrorName = (value: unknown, name: string): boolean => {
  if (!value || typeof value !== 'object' || !('name' in value)) return false;
  return value.name === name;
};

export function ConverterPanel({ engine, settings, onSave }: Props) {
  const [input, setInput] = useState('0');
  const [from, setFrom] = useState<UnitId>('celsius');
  const [to, setTo] = useState<UnitId>('fahrenheit');
  const [result, setResult] = useState<number | null>(32);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setNotice(null);
    const parsed = Number(input);
    if (input.trim() === '' || !Number.isFinite(parsed)) {
      setResult(null);
      setError(input.trim() === '' ? null : en.converter.finiteError);
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

  const minimum = useMemo(() => engine.absoluteZero(from), [engine, from]);
  const formatted = result === null ? '—' : formatNumber(result, settings.precision, settings.roundingMode);

  const swap = () => {
    setFrom(to);
    setTo(from);
    if (result !== null) setInput(String(result));
  };

  const copy = async () => {
    if (result === null) return;
    if (!navigator.clipboard?.writeText) {
      setNotice(en.converter.clipboardUnavailable);
      return;
    }

    try {
      await navigator.clipboard.writeText(`${formatted} ${unitById(to).symbol}`);
      setNotice(en.converter.copied);
    } catch (caught) {
      logEvent('warn', 'clipboard.write_failed', { error: caught });
      setNotice(en.converter.copyFailed);
    }
  };

  const share = async () => {
    if (result === null) return;
    const text = `${input} ${unitById(from).symbol} = ${formatted} ${unitById(to).symbol}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${en.appName} conversion`, text });
        setNotice(en.converter.shared);
      } catch (caught) {
        if (hasErrorName(caught, 'AbortError')) {
          setNotice(null);
          return;
        }
        logEvent('warn', 'share.failed', { error: caught });
        setNotice(en.converter.shareFailed);
      }
      return;
    }

    if (!navigator.clipboard?.writeText) {
      setNotice(en.converter.clipboardUnavailable);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setNotice(en.converter.shareCopied);
    } catch (caught) {
      logEvent('warn', 'share.fallback_copy_failed', { error: caught });
      setNotice(en.converter.shareFailed);
    }
  };

  return (
    <section className="panel hero-panel" aria-labelledby="converter-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{en.converter.eyebrow}</p>
          <h2 id="converter-title">{en.converter.title}</h2>
        </div>
        <button className="ghost-button" type="button" onClick={swap} aria-label={en.converter.swapLabel}>{en.converter.swap}</button>
      </div>

      <div className="converter-grid">
        <label>
          <span>{en.converter.value}</span>
          <input
            autoFocus
            inputMode="decimal"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            aria-describedby={`absolute-zero-note${error ? ' conversion-error' : ''}`}
            aria-invalid={Boolean(error)}
          />
        </label>
        <label>
          <span>{en.converter.from}</span>
          <select value={from} onChange={(event) => setFrom(event.target.value as UnitId)}>
            {UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>)}
          </select>
        </label>
        <label>
          <span>{en.converter.to}</span>
          <select value={to} onChange={(event) => setTo(event.target.value as UnitId)}>
            {UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>)}
          </select>
        </label>
      </div>

      <p id="absolute-zero-note" className="helper">{en.converter.minimum} {formatNumber(minimum, 4, 'half-up')} {unitById(from).symbol}</p>
      {error && <p id="conversion-error" className="error" role="alert">{error}</p>}
      {notice && <p className="helper" role="status">{notice}</p>}

      <div className="result-card" aria-live="polite">
        <span>{en.converter.result}</span>
        <strong>{formatted} <small>{unitById(to).symbol}</small></strong>
      </div>

      <div className="action-row">
        <button type="button" onClick={() => void copy()} disabled={result === null}>{en.converter.copy}</button>
        <button type="button" onClick={() => void share()} disabled={result === null}>{en.converter.share}</button>
        <button
          type="button"
          onClick={() => {
            const parsed = Number(input);
            if (result !== null && Number.isFinite(parsed)) onSave({ input: parsed, output: result, from, to });
          }}
          disabled={result === null}
        >{en.converter.save}</button>
      </div>
    </section>
  );
}
