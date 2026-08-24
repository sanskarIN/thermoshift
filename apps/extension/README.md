# ThermoShift Browser Extension

This directory contains the next-version browser-extension foundation. It is intentionally isolated from the current Web/PWA and native release line until the hardening work on `main` is complete.

## Design constraints

- Manifest V3.
- No requested browser permissions or host permissions for the conversion popup.
- No remote scripts, analytics, account, or backend.
- Conversion formulas are not duplicated in JavaScript. The popup loads the same `thermoshift-wasm` bridge backed by `thermoshift-core`.
- Extension source version must match the repository version.
- Generated WebAssembly and packaged output are build artifacts and remain outside Git.

## Verify source invariants

From the repository root:

```bash
npm run verify:extension-config
```

This checks the Manifest V3 contract, version alignment, permission-free baseline, local-only CSP, absence of inline popup scripts, and canonical WASM import.

## Build

Install the normal ThermoShift prerequisites, including `wasm-pack`, then run:

```bash
npm run extension:build
```

The build script creates `apps/extension/dist/`, compiles `thermoshift-wasm` into `dist/generated/`, and copies the reviewed extension source files into the package directory.

## Load for Chromium-family development

After building, use the browser's extension developer mode and load the unpacked `apps/extension/dist/` directory. Do not package or publish a store release until the extension-specific verification matrix in `docs/browser-extension.md` is complete.

## Next steps

The foundation is Chromium/Manifest-V3-first. Firefox compatibility, automated extension-browser tests, icons/store artwork, signed packages, store metadata, and publication are separate verification gates rather than assumed support.
