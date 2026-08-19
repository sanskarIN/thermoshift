interface Props { engineVersion: string; }

export function AboutPanel({ engineVersion }: Props) {
  return (
    <section className="panel about-panel" aria-labelledby="about-title">
      <img src="/logo.svg" width="96" height="96" alt="ThermoShift logo" />
      <div>
        <p className="eyebrow">Open source · MIT licensed</p>
        <h2 id="about-title">About ThermoShift</h2>
        <p>ThermoShift is a private, offline-first temperature converter powered by a canonical Rust engine. No sign-in, tracking account, or server-side conversion is required.</p>
        <p><strong>Engine version:</strong> {engineVersion}</p>
        <p><strong>Made by the Sanskar</strong></p>
        <div className="link-list">
          <a href="https://github.com/sanskarIN/thermoshift" target="_blank" rel="noreferrer">GitHub repository</a>
          <a href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">Buy Me a Coffee</a>
          <a href="mailto:sanskarin@outlook.in">sanskarin@outlook.in</a>
          <a href="mailto:sanskarin.business@gmail.com">sanskarin.business@gmail.com</a>
          <a href="mailto:supportramsandesh@gmail.com">Support</a>
        </div>
      </div>
    </section>
  );
}
