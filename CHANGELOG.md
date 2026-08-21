# Changelog

All notable changes to ThermoShift are documented here. The project follows semantic versioning once releases are tagged.

## [Unreleased]

### Added

- Canonical Rust conversion engine for eight temperature scales.
- Physical validation against absolute zero.
- WebAssembly bridge for browser use.
- React/TypeScript PWA with converter, batch mode, history, formulas, settings, About, export, copy, and share flows.
- Offline PWA configuration and responsive accessible design system.
- Tauri native shell for Windows, macOS, Linux, Android, and iOS/iPadOS.
- Shared Tauri library entry point for desktop and mobile targets.
- Android and iOS lifecycle commands for initialization, development, execution, APK/AAB generation, and Apple builds.
- Mobile-aware Vite host/HMR configuration for physical-device development.
- PWA install-prompt lifecycle and in-app **Install app** action where supported.
- Mobile safe-area, dynamic viewport, coarse-pointer, and touch-target improvements.
- Native cross-platform configuration invariant verification in CI.
- Committed npm and Cargo lockfiles plus lockfile regeneration/verification with reviewable generated artifacts.
- Explicit Node 22/npm 10.9 project toolchain contract with `.nvmrc` and npm engine enforcement.
- Unit, UI, storage, install-prompt, E2E, and automated accessibility test foundations.
- Complete Android/iOS setup, development, packaging, signing-boundary, troubleshooting, and release documentation.
- CI, CodeQL, dependency auditing, Dependabot, release workflow, issue templates, and project documentation.

### Changed

- Refactored the Tauri application so desktop `main.rs` delegates to the same `thermoshift_lib::run()` runtime used by mobile targets.
- Expanded platform/release documentation to distinguish configured native targets from release-verified packages.
- Expanded the PWA manifest metadata for standalone installation across modern device classes.
- Updated GitHub checkout/setup-node workflow actions to their Node-24-runtime v5 lines.
- Added PR workflow concurrency so superseded CI, security, CodeQL, and lockfile runs are cancelled automatically.
- Updated `vite-plugin-pwa` to the 1.3.x line and removed the optional asset-generator package from ThermoShift's dependency graph.
- CI, dependency audits, and tagged web releases now consume reviewed dependency resolutions with `npm ci` and Cargo `--locked` where applicable.
- Web production output explicitly targets ES2020 and Safari 14 so the browser/PWA build aligns with the configured iOS/iPadOS 14 native minimum.

### Fixed

- Fixed the WebAssembly bridge for current `wasm-bindgen` by returning the engine version as an owned `String` instead of a borrowed `&'static str`.
- Applied the Rust formatting required by `cargo fmt --all -- --check` to the shared native runtime.
- Removed the high-severity `sharp <0.35.0` / libvips vulnerability path introduced through the PWA asset-generator dependency.
- Fixed absolute-zero validation expectations for reversed scales such as Delisle.
- Fixed browser share capability detection and clarified the absolute-zero UI boundary.
- Fixed typed ESLint coverage for Vite/Playwright files, strict async test lint violations, and unnecessary CSV quote escapes uncovered by live CI.
