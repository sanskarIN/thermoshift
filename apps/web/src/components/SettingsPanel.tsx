import type { Settings } from '../types';

interface Props { settings: Settings; onChange: (settings: Settings) => void; }

export function SettingsPanel({ settings, onChange }: Props) {
  const patch = (next: Partial<Settings>) => onChange({ ...settings, ...next });
  return (
    <section className="panel" aria-labelledby="settings-title">
      <div className="panel-heading"><div><p className="eyebrow">Make it yours</p><h2 id="settings-title">Settings</h2></div></div>
      <div className="settings-grid">
        <label><span>Decimal precision</span><input type="number" min="0" max="12" value={settings.precision} onChange={(event) => patch({ precision: Math.min(12, Math.max(0, Number(event.target.value))) })} /></label>
        <label><span>Rounding</span><select value={settings.roundingMode} onChange={(event) => patch({ roundingMode: event.target.value === 'truncate' ? 'truncate' : 'half-up' })}><option value="half-up">Round to nearest</option><option value="truncate">Truncate</option></select></label>
        <label><span>Theme</span><select value={settings.theme} onChange={(event) => patch({ theme: event.target.value as Settings['theme'] })}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
        <label className="toggle"><input type="checkbox" checked={settings.highContrast} onChange={(event) => patch({ highContrast: event.target.checked })} /><span>High contrast</span></label>
        <label className="toggle"><input type="checkbox" checked={settings.reducedMotion} onChange={(event) => patch({ reducedMotion: event.target.checked })} /><span>Reduce motion</span></label>
      </div>
      <p className="helper">Preferences are stored locally in your browser. ThermoShift has no account requirement.</p>
    </section>
  );
}
