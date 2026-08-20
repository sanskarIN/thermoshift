import { en } from '../i18n/en';
import { ProjectLinks } from './ProjectLinks';

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
        <ProjectLinks />
      </div>
    </section>
  );
}
