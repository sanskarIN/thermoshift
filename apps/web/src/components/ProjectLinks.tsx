import { en } from '../i18n/en';

export function ProjectLinks() {
  return (
    <div className="link-list">
      <a href="https://github.com/sanskarIN/thermoshift" target="_blank" rel="noreferrer">{en.about.github}</a>
      <a href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">{en.about.bmc}</a>
      <a href="mailto:sanskarin@outlook.in">sanskarin@outlook.in</a>
      <a href="mailto:sanskarin.business@gmail.com">sanskarin.business@gmail.com</a>
      <a href="mailto:supportramsandesh@gmail.com">{en.about.support}</a>
    </div>
  );
}
