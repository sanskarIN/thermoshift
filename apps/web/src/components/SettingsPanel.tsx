import type { Settings } from '../types';

interface Props {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onResetData: () => void;
}

export function SettingsPanel({ settings, onChange, onResetData }: Props) {
  const patch = (next: Partial<Settings>) => onChange({ ...settings, ...next });
  const updatePrecision = (raw: string) => {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) patch({ precision: Math.min(12, Math.max(0, Math.trunc(parsed))) });
  };

  return (
    <section className="panel" aria-labelledby="settings-title">
      <div className="panel-heading"><div><p className="eyebrow">Make it yours</p><h2 id="settings-title">Settings</h2></div></div>

      <div className="settings-section">
        <h3>Conversion</h3>
        <div className="settings-grid">
          <label><span>Decimal precision</span><input type="number" min="0" max="12" value={settings.precision} onChange={(event) => updatePrecision(event.target.value)} /></label>
          <label><span>Rounding</span><select value={settings.roundingMode} onChange={(event) => patch({ roundingMode: event.target.value === 'truncate' ? 'truncate' : 'half-up' })}><option value="half-up">Round half away from zero</option><option value="truncate">Truncate</option></select></label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Appearance & accessibility</h3>
        <div className="settings-grid">
          <label><span>Theme</span><select value={settings.theme} onChange={(event) => patch({ theme: event.target.value as Settings['theme'] })}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
          <label className="toggle"><input type="checkbox" checked={settings.highContrast} onChange={(event) => patch({ highContrast: event.target.checked })} /><span>High contrast</span></label>
          <label className="toggle"><input type="checkbox" checked={settings.reducedMotion} onChange={(event) => patch({ reducedMotion: event.target.checked })} /><span>Reduce motion</span></label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Privacy & data</h3>
        <p className="helper">Preferences and saved history stay in browser-managed local storage. ThermoShift requires no account.</p>
        <button className="danger-button" type="button" onClick={onResetData}>Reset local data</button>
      </div>
    </section>
  );
}
