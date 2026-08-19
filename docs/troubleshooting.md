# Troubleshooting

## The web app says the precision engine failed to load

Run `npm --workspace @thermoshift/web run wasm:build` and confirm `wasm32-unknown-unknown` plus `wasm-pack` are installed. Then restart Vite.

## wasm-pack is missing

```bash
cargo install wasm-pack --locked
```

## Browser shows stale assets

Close installed PWA windows, clear this site's application cache/service worker from browser developer tools, and reload. This removes cached application files; separately saved local history may also be removed if all site data is cleared.

## Desktop build fails before Rust compilation

Verify the Tauri 2 platform prerequisites for the exact operating-system release. Linux package names vary by distribution.

## A temperature is rejected

ThermoShift rejects finite numeric inputs below absolute zero for the selected source scale. The converter shows the scale-specific minimum next to the input.
