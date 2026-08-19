import { useMemo } from 'react';

import { unitById } from '../data/units';
import { formatNumber } from '../lib/format';
import type { TemperatureEngine } from '../lib/engine';
import type { Settings, UnitId } from '../types';

const REFERENCES = [
  { label: 'Absolute zero', celsius: -273.15, detail: 'Lowest thermodynamic temperature' },
  { label: 'Water freezes', celsius: 0, detail: 'At standard atmospheric pressure' },
  { label: 'Comfortable room', celsius: 22, detail: 'Typical indoor reference' },
  { label: 'Human body', celsius: 37, detail: 'Common approximate reference' },
  { label: 'Water boils', celsius: 100, detail: 'At standard atmospheric pressure' },
] as const;

interface Props { engine: TemperatureEngine; settings: Settings; unit: UnitId; }

export function ReferenceCards({ engine, settings, unit }: Props) {
  const rows = useMemo(() => REFERENCES.map((reference) => ({
    ...reference,
    value: engine.convert(reference.celsius, 'celsius', unit),
  })), [engine, unit]);

  return (
    <section className="panel" aria-labelledby="references-title">
      <div className="panel-heading"><div><p className="eyebrow">Learn by comparison</p><h2 id="references-title">Reference points</h2></div></div>
      <div className="reference-grid">
        {rows.map((row) => (
          <article className="reference-card" key={row.label}>
            <span>{row.label}</span>
            <strong>{formatNumber(row.value, settings.precision, settings.roundingMode)} {unitById(unit).symbol}</strong>
            <small>{row.detail}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
