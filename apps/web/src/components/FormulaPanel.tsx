const FORMULAS = [
  { scale: 'Celsius ↔ Fahrenheit', formula: '°F = (°C × 9/5) + 32', inverse: '°C = (°F − 32) × 5/9', note: 'The scales have different interval sizes and offsets.' },
  { scale: 'Celsius ↔ Kelvin', formula: 'K = °C + 273.15', inverse: '°C = K − 273.15', note: 'Kelvin uses the same interval size as Celsius but starts at absolute zero.' },
  { scale: 'Kelvin ↔ Rankine', formula: '°R = K × 9/5', inverse: 'K = °R × 5/9', note: 'Both are absolute scales; Rankine uses Fahrenheit-sized intervals.' },
  { scale: 'Celsius ↔ Réaumur', formula: '°Ré = °C × 4/5', inverse: '°C = °Ré × 5/4', note: 'Water freezes at 0 °Ré and boils at 80 °Ré.' },
  { scale: 'Celsius ↔ Delisle', formula: '°De = (100 − °C) × 3/2', inverse: '°C = 100 − °De × 2/3', note: 'Delisle is reversed: larger values represent colder temperatures.' },
  { scale: 'Celsius ↔ Newton', formula: '°N = °C × 33/100', inverse: '°C = °N × 100/33', note: 'Newton used 0 for freezing and 33 for boiling water.' },
  { scale: 'Celsius ↔ Rømer', formula: '°Rø = °C × 21/40 + 7.5', inverse: '°C = (°Rø − 7.5) × 40/21', note: 'Rømer’s scale places water freezing at 7.5 °Rø.' },
] as const;

export function FormulaPanel() {
  return (
    <section className="panel" aria-labelledby="formula-title">
      <div className="panel-heading"><div><p className="eyebrow">Understand the math</p><h2 id="formula-title">Formula guide</h2></div></div>
      <p className="lead">ThermoShift’s Rust engine converts through Kelvin as a common thermodynamic reference. The direct equations below are mathematically equivalent.</p>
      <div className="formula-grid">
        {FORMULAS.map((item) => <article className="formula-card" key={item.scale}><h3>{item.scale}</h3><code>{item.formula}</code><code>{item.inverse}</code><p>{item.note}</p></article>)}
      </div>
    </section>
  );
}
