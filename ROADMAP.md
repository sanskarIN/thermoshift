# ThermoShift Roadmap

## 0.1 — Foundation and first public preview

- [x] Canonical Rust temperature engine.
- [x] Eight scales and absolute-zero validation.
- [x] React PWA with WebAssembly integration.
- [x] Batch conversion and local history.
- [x] Formula/reference education surfaces.
- [x] Local settings, themes, high contrast, and reduced motion.
- [x] Tauri native target configuration for Windows, macOS, Linux, Android, and iOS/iPadOS.
- [x] Shared Tauri library entry point across desktop and mobile.
- [x] Mobile-safe PWA/native webview layout and install-prompt UX.
- [x] CI/security/repository automation baseline including native configuration invariants.
- [x] Android/iOS setup, development, packaging, and release documentation.
- [ ] Produce first real cross-platform screenshots from packaged builds.
- [ ] Complete real native package smoke tests on Windows, macOS, Linux, Android, and iOS before promoting those targets from configured to release-verified.

## 0.2 — Reliability polish

- [ ] Add import/restore for exported history after schema validation design review.
- [ ] Add broader browser/device E2E matrix after the preview stabilizes.
- [ ] Add Android emulator and iOS simulator automation after the generated Tauri host projects are verified on real toolchains.
- [ ] Add fuzz target for unit string parsing if nightly/fuzz infrastructure is adopted.
- [ ] Add signed native release jobs after repository owners configure Windows/macOS/Android/iOS signing secrets.
- [ ] Add release artifact checksums for every automated package format.

## 1.0 — Stable foundation

- [ ] Complete clean-checkout verification on Windows, macOS, Linux, Android, iOS/iPadOS, and at least two major browser engines.
- [ ] Verify accessibility on keyboard, touch, screen-reader, high-contrast, reduced-motion, and mobile safe-area scenarios.
- [ ] Close all blocker/high-severity defects.
- [ ] Publish stable release notes, checksums, screenshots, supported-platform evidence, and reproducible release documentation.

## 1.5.0 — Reliability, productivity, and browser extension

### Release engineering

- [x] Create an isolated `release/v1.5.0-prep` line from the current hardened candidate.
- [x] Add a semantic-version consistency verifier across npm, Rust, and Tauri metadata.
- [x] Make version consistency a CI repository invariant.
- [x] Align explicit application/package/crate metadata to 1.5.0 on the preparation branch.
- [ ] Regenerate and review npm/Cargo lockfiles for the version transition.
- [ ] Require CI, CodeQL, dependency security, lockfile verification, coverage, production build, and E2E to pass on one final candidate SHA.
- [ ] Add release artifact checksums/manifests and verify published contents.

### Reliability and data

- [ ] Port versioned backup/restore only after schema validation and migration tests pass.
- [ ] Add safer history management and recoverable destructive interactions.
- [ ] Add installed-PWA update-state handling with tests.
- [ ] Keep user-facing failures generic while retaining useful developer diagnostics.

### Productivity and accessibility

- [ ] Port reviewed first-run onboarding with keyboard/screen-reader behavior covered.
- [ ] Port reviewed quick actions and focus-management behavior.
- [ ] Expand history filtering/management without weakening local-only privacy.
- [ ] Expand accessibility regression coverage for dialogs, keyboard shortcuts, touch, contrast, and reduced motion.

### Browser extension

- [x] Create a separate permission-free Manifest V3 foundation branch.
- [x] Keep extension conversion backed by the canonical Rust/WASM engine instead of duplicated JavaScript formulas.
- [ ] Reconcile the extension foundation onto the hardened/release line.
- [ ] Verify Chromium packaging and popup behavior.
- [ ] Verify Firefox compatibility and document any manifest differences.
- [ ] Add automated extension build/invariant checks to the final 1.5.0 candidate.
- [ ] Produce unsigned review artifacts before any browser-store signing/publication work.

### Native release evidence

- [ ] Windows package build and smoke test.
- [ ] macOS package build and smoke test.
- [ ] Linux package build and smoke test.
- [ ] Android APK/AAB build plus emulator and real-device smoke test.
- [ ] iOS/iPadOS simulator/device build on macOS/Xcode.
- [ ] Record artifact filenames/checksums, tested OS/device versions, and known limitations.
- [ ] Configure owner-controlled signing/notarization/store credentials without committing secrets.

See [`docs/version-1.5.0.md`](docs/version-1.5.0.md) for the detailed acceptance and evidence policy.
