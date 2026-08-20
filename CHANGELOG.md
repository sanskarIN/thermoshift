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
- Unit, UI, storage, install-prompt, E2E, and automated accessibility test foundations.
- Complete Android/iOS setup, development, packaging, signing-boundary, troubleshooting, and release documentation.
- CI, CodeQL, dependency auditing, Dependabot, release workflow, issue templates, and project documentation.

### Changed

- Refactored the Tauri application so desktop `main.rs` delegates to the same `thermoshift_lib::run()` runtime used by mobile targets.
- Expanded platform/release documentation to distinguish configured native targets from release-verified packages.
- Expanded the PWA manifest metadata for standalone installation across modern device classes.
