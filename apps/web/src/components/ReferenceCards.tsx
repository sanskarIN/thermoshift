import { useMemo, useState } from 'react';

import { UNITS, unitById } from '../data/units';
import { en } from '../i18n/en';
import { formatNumber } from '../lib/format';
import type { TemperatureEngine } from '../lib/engine';
import type { Settings, UnitId } from '../types';

const REFERENCES = en.references.points.map(([label, celsius, detail]) => ({ label, celsius, detail }));

interface Props { engine: TemperatureEngine; settings: Settings; }

export function ReferenceCards({ engine, settings }: Props) {
  const [unit, setUnit] = useState<UnitId>('fahrenheit');
  const rows = useMemo(() => REFERENCES.map((reference) => ({
    ...reference,
    value: engine.convert(reference.celsius, 'celsius', unit),
  })), [engine, unit]);

  return (
    <section className="panel" aria-labelledby="references-title">
      <div className="panel-heading">
        <div><p className="eyebrow">{en.references.eyebrow}</p><h2 id="references-title">{en.references.title}</h2></div>
        <label className="inline-control">
          <span>{en.references.showIn}</span>
          <select value={unit} onChange={(event) => setUnit(event.target.value as UnitId)}>
            {UNITS.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} ({candidate.symbol})</option>)}
          </select>
        </label>
      </div>
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
