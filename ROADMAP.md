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
- [ ] Complete clean final-head CI/security/lockfile verification for the preview candidate.
- [ ] Complete real native package smoke tests on Windows, macOS, Linux, Android, and iOS before promoting those targets from configured to release-verified.

## 0.2 — Reliability polish and extension foundation

- [ ] Add import/restore for exported history after schema validation design review.
- [ ] Add broader browser/device E2E matrix after the preview stabilizes.
- [ ] Add Android emulator and iOS simulator automation after the generated Tauri host projects are verified on real toolchains.
- [ ] Add fuzz target for unit string parsing if nightly/fuzz infrastructure is adopted.
- [ ] Add signed native release jobs after repository owners configure Windows/macOS/Android/iOS signing secrets.
- [ ] Add release artifact checksums for every automated package format.
- [x] Establish a permission-free Manifest V3 browser-extension source foundation that reuses `thermoshift-wasm`.
- [x] Add extension source invariants and an unsigned package build workflow.
- [ ] Verify the unpacked extension on current Chrome and Edge builds.
- [ ] Add Firefox-specific packaging only after shared Manifest V3 behavior is verified.
- [ ] Add browser-extension E2E coverage, real screenshots, deterministic package checksums, store assets, and publication evidence.

## 1.0 — Stable

- [ ] Complete clean-checkout verification on Windows, macOS, Linux, Android, iOS/iPadOS, and at least two major browser engines.
- [ ] Verify accessibility on keyboard, touch, screen-reader, high-contrast, reduced-motion, and mobile safe-area scenarios.
- [ ] Close all blocker/high-severity defects.
- [ ] Publish stable release notes, checksums, screenshots, supported-platform evidence, and reproducible release documentation.
