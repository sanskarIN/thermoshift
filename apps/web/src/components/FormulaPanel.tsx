import { en } from '../i18n/en';

export function FormulaPanel() {
  return (
    <section className="panel" aria-labelledby="formula-title">
      <div className="panel-heading"><div><p className="eyebrow">{en.formulas.eyebrow}</p><h2 id="formula-title">{en.formulas.title}</h2></div></div>
      <p className="lead">{en.formulas.intro}</p>
      <div className="formula-grid">
        {en.formulas.items.map(([scale, formula, inverse, note, derivation]) => (
          <article className="formula-card" key={scale}>
            <h3>{scale}</h3>
            <code>{formula}</code>
            <code>{inverse}</code>
            <p>{note}</p>
            <details>
              <summary>{en.formulas.derivationLabel}</summary>
              <p>{derivation}</p>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
