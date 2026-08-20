# Architecture

ThermoShift is a modular monorepo with a deliberately small domain core and a shared presentation/native delivery model.

## Layers

1. `crates/thermoshift-core`: dependency-free Rust domain logic. It owns supported units, conversion formulas, absolute-zero validation, and error semantics.
2. `crates/thermoshift-wasm`: thin `wasm-bindgen` adapter. It translates JavaScript-friendly strings into Rust units and exposes domain calls to the browser frontend.
3. `apps/web`: React/TypeScript presentation, local persistence, export/share adapters, PWA service worker configuration, install UX, accessibility, and educational content.
4. `apps/desktop/src-tauri`: shared Tauri 2 native shell for Windows, macOS, Linux, Android, and iOS/iPadOS. Despite the historical directory name, this crate is no longer desktop-only.

Conversion formulas must not be reimplemented in TypeScript, Kotlin/Java, Swift/Objective-C, or other platform-specific UI code. UI metadata such as labels, descriptions, and educational equations may be represented in TypeScript because it is presentation content rather than executable conversion logic.

## Native entrypoint model

Tauri mobile targets load the application as a library, while desktop targets launch an executable. To keep one native runtime implementation:

- `apps/desktop/src-tauri/Cargo.toml` builds `thermoshift_lib` as `staticlib`, `cdylib`, and `rlib`.
- `apps/desktop/src-tauri/src/lib.rs` owns commands, setup, and `run()`.
- `run()` is annotated with `#[cfg_attr(mobile, tauri::mobile_entry_point)]` so Android/iOS can enter the same runtime.
- `apps/desktop/src-tauri/src/main.rs` is intentionally thin and delegates to `thermoshift_lib::run()` for desktop execution.

This prevents desktop and mobile shells from drifting into separate application implementations.

## Delivery paths

### Web and PWA

Vite builds the React application and generated Rust WebAssembly bridge. The service worker provides offline asset caching. Browser installation remains available where supported.

### Desktop native

Tauri packages the same frontend and links the same Rust core for Windows, macOS, and Linux.

### Mobile native

Tauri generates Android and Apple host projects from the same native crate. Android and iOS/iPadOS use the shared Tauri `run()` entry point and the same frontend assets. Mobile-specific platform projects are generated with Tauri's `android init` / `ios init` commands rather than hand-authored copies.

## Development server boundary

Physical mobile devices must sometimes reach Vite over the local network. Tauri sets `TAURI_DEV_HOST` for its mobile host mode; `apps/web/vite.config.ts` uses that value to bind the dev server and HMR to the selected address while retaining localhost behavior for normal web/desktop development.

## State

No server state is required. Browser settings/history use versioned local-storage keys. The service worker caches build artifacts. Tauri webviews follow the same frontend persistence model, subject to each platform webview's local storage implementation.

## Failure boundaries

Invalid inputs fail in the Rust domain before a result is emitted. The WASM and Tauri adapters convert domain errors into user-safe strings. Persistence parsing treats malformed local data as recoverable and falls back to safe defaults.

## Security boundary

The conversion engine is pure computation. The web app does not request network data for core functionality. Tauri uses a minimal capability set and a restrictive CSP. External support/funding links are explicit user actions. Native signing keys, Android keystores, Apple certificates, and provisioning material are release secrets and must never be committed.

## Cross-platform invariants

`scripts/verify-native-config.mjs` runs in CI and verifies the stable application identifier, Android/iOS minimum versions, shared-library crate types, mobile entry point, desktop delegation, and required lifecycle commands. It is a fast structural guard; it complements rather than replaces real target builds and device smoke tests.
