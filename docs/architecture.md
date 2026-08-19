# Architecture

ThermoShift is a modular monorepo with a deliberately small domain core.

## Layers

1. `crates/thermoshift-core`: dependency-free Rust domain logic. It owns supported units, conversion formulas, absolute-zero validation, and error semantics.
2. `crates/thermoshift-wasm`: thin `wasm-bindgen` adapter. It translates JavaScript-friendly strings into Rust units and exposes domain calls to the browser.
3. `apps/web`: React/TypeScript presentation, local persistence, export/share adapters, PWA service worker configuration, accessibility, and educational content.
4. `apps/desktop/src-tauri`: native packaging and a small command adapter that links the same core.

Conversion formulas must not be reimplemented in TypeScript or platform-specific UI code. UI metadata such as labels, descriptions, and educational equations may be represented in TypeScript because it is presentation content rather than executable conversion logic.

## State

No server state is required. Browser settings/history use versioned local-storage keys. The service worker caches build artifacts. Desktop webview state follows the same frontend model.

## Failure boundaries

Invalid inputs fail in the Rust domain before a result is emitted. The WASM and Tauri adapters convert domain errors into user-safe strings. Persistence parsing treats malformed local data as recoverable and falls back to safe defaults.

## Security boundary

The conversion engine is pure computation. The web app does not request network data for core functionality. Tauri uses a minimal capability set and a restrictive CSP. External support/funding links are explicit user actions.
