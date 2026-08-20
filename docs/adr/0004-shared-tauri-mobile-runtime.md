# ADR 0004: Share one Tauri runtime across desktop and mobile

- Status: Accepted
- Date: 2026-08-20

## Context

ThermoShift originally used Tauri only as a desktop delivery shell. Expanding native delivery to Android and iOS could create separate platform entrypoints, duplicated commands, or platform-specific conversion implementations. That would increase drift risk and make correctness harder to review.

Tauri 2 mobile applications require the native crate to expose a library entry point, while desktop applications still launch an executable.

## Decision

Use one Tauri Rust library for Windows, macOS, Linux, Android, and iOS/iPadOS.

- Build `thermoshift_lib` as `staticlib`, `cdylib`, and `rlib`.
- Keep Tauri commands and application setup in `src/lib.rs`.
- Mark the shared `run()` function with `#[cfg_attr(mobile, tauri::mobile_entry_point)]`.
- Keep desktop `src/main.rs` as a minimal delegate to `thermoshift_lib::run()`.
- Keep the React/Vite frontend shared across web, desktop, and mobile.
- Keep all executable temperature formulas in `thermoshift-core`; do not reproduce them in Kotlin/Java, Swift, or TypeScript.
- Generate Android/iOS host projects with the Tauri CLI rather than maintaining hand-written duplicate application shells.

## Consequences

### Positive

- One native runtime owns command registration and setup.
- Desktop and mobile behavior are less likely to drift.
- Platform expansion does not create a second conversion engine.
- Native target structure can be checked cheaply in CI.
- Mobile development can reuse the existing frontend and local-first privacy model.

### Trade-offs

- Android still requires the Android SDK/NDK and Rust mobile targets.
- iOS development and packaging still require macOS/Xcode and Apple signing for distribution.
- Generated host projects may need to be committed later if intentional Kotlin/Swift customization is introduced.
- Structural CI checks do not replace real builds and device smoke tests.

## Verification

`scripts/verify-native-config.mjs` verifies the required crate types, mobile entry point, desktop delegation, platform minimum versions, and Android/iOS lifecycle scripts. Release readiness additionally requires real target builds and smoke testing as documented in `docs/mobile.md` and `docs/release.md`.
