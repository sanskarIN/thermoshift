const FORMULAS = [
  {
    scale: 'Celsius ↔ Fahrenheit',
    formula: '°F = (°C × 9/5) + 32',
    inverse: '°C = (°F − 32) × 5/9',
    note: 'The scales have different interval sizes and offsets.',
    derivation: 'Between water freezing and boiling, Celsius spans 100 degrees while Fahrenheit spans 180. The interval ratio is therefore 180/100 = 9/5. Aligning the freezing points adds the 32-degree Fahrenheit offset.',
  },
  {
    scale: 'Celsius ↔ Kelvin',
    formula: 'K = °C + 273.15',
    inverse: '°C = K − 273.15',
    note: 'Kelvin uses the same interval size as Celsius but starts at absolute zero.',
    derivation: 'A change of 1 °C equals a change of 1 K. Absolute zero is −273.15 °C and 0 K, so the scales differ only by the 273.15 offset.',
  },
  {
    scale: 'Kelvin ↔ Rankine',
    formula: '°R = K × 9/5',
    inverse: 'K = °R × 5/9',
    note: 'Both are absolute scales; Rankine uses Fahrenheit-sized intervals.',
    derivation: 'Both scales begin at absolute zero. Because a Fahrenheit/Rankine interval is 5/9 the size of a Celsius/Kelvin interval, Kelvin values are multiplied by 9/5 to express the same absolute temperature in Rankine.',
  },
  {
    scale: 'Celsius ↔ Réaumur',
    formula: '°Ré = °C × 4/5',
    inverse: '°C = °Ré × 5/4',
    note: 'Water freezes at 0 °Ré and boils at 80 °Ré.',
    derivation: 'Celsius and Réaumur share a zero at water freezing. Their boiling references are 100 °C and 80 °Ré, producing an interval ratio of 80/100 = 4/5.',
  },
  {
    scale: 'Celsius ↔ Delisle',
    formula: '°De = (100 − °C) × 3/2',
    inverse: '°C = 100 − °De × 2/3',
    note: 'Delisle is reversed: larger values represent colder temperatures.',
    derivation: 'The traditional Delisle scale places boiling water at 0 °De and freezing water at 150 °De. Subtracting Celsius from 100 reverses direction, then multiplying by 150/100 = 3/2 sets the interval size.',
  },
  {
    scale: 'Celsius ↔ Newton',
    formula: '°N = °C × 33/100',
    inverse: '°C = °N × 100/33',
    note: 'Newton used 0 for freezing and 33 for boiling water.',
    derivation: 'Both scales use water freezing as zero. Mapping the Celsius boiling reference of 100 to Newton’s 33 gives the scale factor 33/100.',
  },
  {
    scale: 'Celsius ↔ Rømer',
    formula: '°Rø = °C × 21/40 + 7.5',
    inverse: '°C = (°Rø − 7.5) × 40/21',
    note: 'Rømer’s scale places water freezing at 7.5 °Rø.',
    derivation: 'Water freezes at 0 °C / 7.5 °Rø and boils at 100 °C / 60 °Rø. The interval is 52.5 Rømer degrees over 100 Celsius degrees, or 21/40, followed by the 7.5-degree offset.',
  },
] as const;

export function FormulaPanel() {
  return (
    <section className="panel" aria-labelledby="formula-title">
      <div className="panel-heading"><div><p className="eyebrow">Understand the math</p><h2 id="formula-title">Formula guide</h2></div></div>
      <p className="lead">ThermoShift’s Rust engine converts through Kelvin as a common thermodynamic reference. The direct equations below are mathematically equivalent. Historical water reference points are educational approximations and depend on pressure and scale definition.</p>
      <div className="formula-grid">
        {FORMULAS.map((item) => (
          <article className="formula-card" key={item.scale}>
            <h3>{item.scale}</h3>
            <code>{item.formula}</code>
            <code>{item.inverse}</code>
            <p>{item.note}</p>
            <details>
              <summary>Derivation note</summary>
              <p>{item.derivation}</p>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
