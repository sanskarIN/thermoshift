# Testing Strategy

ThermoShift uses layered tests.

## Rust unit/domain tests

`cargo test -p thermoshift-core` verifies canonical reference points, all-scale round trips, absolute zero, and non-finite rejection. Domain regressions belong here first.

## Web unit/component tests

Vitest checks formatting, persistence hardening, install-prompt behavior, and React startup behavior. The application engine is mocked only in presentation tests; formula correctness remains owned by Rust tests.

## End-to-end and accessibility

Playwright verifies a real conversion in the built PWA on desktop Chromium and a Pixel 7 device profile. axe scans the primary flow for automatically detectable accessibility violations.

## Repository and lockfile invariants

`npm run verify:native-config` checks the shared Tauri desktop/Android/iOS structure without requiring native SDKs. The Lockfile Verification workflow regenerates `package-lock.json` and `Cargo.lock`, uploads the generated files for review, and fails when committed lockfiles no longer match dependency manifests.

## CI expectations

Pull requests should fail when formatting, Clippy, TypeScript checking, ESLint, tests, coverage thresholds, PWA build, E2E checks, native configuration invariants, or lockfile verification fail. Security analysis runs separately through CodeQL and dependency-audit workflows. PR workflows use per-ref concurrency so superseded runs are cancelled instead of consuming runner capacity.

## Manual release checks

Keyboard-only navigation, screen-reader labels, contrast, offline launch, installability, copy/share fallbacks, local history, exports, Android/iOS real-device behavior, and each target desktop package must be manually smoke-tested before stable releases.
