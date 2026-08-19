import { en } from '../i18n/en';

interface Props { engineVersion: string; }

export function AboutPanel({ engineVersion }: Props) {
  return (
    <section className="panel about-panel" aria-labelledby="about-title">
      <img src="/logo.svg" width="96" height="96" alt={en.shell.logoAlt} />
      <div>
        <p className="eyebrow">{en.about.eyebrow}</p>
        <h2 id="about-title">{en.about.title}</h2>
        <p>{en.about.description}</p>
        <p><strong>{en.about.engineVersion}</strong> {engineVersion}</p>
        <p><strong>{en.madeBy}</strong></p>
        <div className="link-list">
          <a href="https://github.com/sanskarIN/thermoshift" target="_blank" rel="noreferrer">{en.about.github}</a>
          <a href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">{en.about.bmc}</a>
          <a href="mailto:sanskarin@outlook.in">sanskarin@outlook.in</a>
          <a href="mailto:sanskarin.business@gmail.com">sanskarin.business@gmail.com</a>
          <a href="mailto:supportramsandesh@gmail.com">{en.about.support}</a>
        </div>
      </div>
    </section>
  );
}
