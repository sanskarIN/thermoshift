# ThermoShift Roadmap

## 0.1 — Foundation and first public preview

- [x] Canonical Rust temperature engine.
- [x] Eight scales and absolute-zero validation.
- [x] React PWA with WebAssembly integration.
- [x] Batch conversion and local history.
- [x] Formula/reference education surfaces.
- [x] Local settings, themes, high contrast, and reduced motion.
- [x] Tauri desktop target configuration.
- [x] CI/security/repository automation baseline.
- [ ] Produce first real cross-platform screenshots from verified packaged builds.
- [ ] Verify clean CI after dependency lockfiles are generated and reviewed.

## 0.2 — Reliability and usability polish

- [x] Add first-run onboarding with local-first privacy guidance.
- [x] Add Quick Actions and keyboard-first page navigation.
- [x] Add history search, scale filters, individual deletion, clear, and undo.
- [x] Add versioned full-data backup and strict validated restore.
- [x] Add selectable scale for reference cards.
- [x] Add educational formula derivation notes.
- [x] Externalize English product copy for internationalization-ready UI architecture.
- [x] Add reusable dialog focus containment and expanded accessibility regression tests.
- [x] Add dense cross-scale Rust conversion invariants and broader frontend regression tests.
- [ ] Validate the complete v0.2 branch with live GitHub CI/toolchains.
- [ ] Generate and review npm/Cargo dependency lockfiles from a successful clean dependency resolution.
- [ ] Add broader real-browser/device E2E evidence after Chromium/mobile preview checks are green.
- [ ] Add fuzz target for unit string parsing if nightly/fuzz infrastructure is adopted.
- [ ] Add signed desktop release jobs after repository owners configure platform signing secrets.

## 1.0 — Stable

- [ ] Complete clean-checkout verification on Windows, macOS, Linux, and at least two major browser engines.
- [ ] Close all blocker/high-severity defects.
- [ ] Verify PWA install/offline behavior on real desktop and mobile devices.
- [ ] Verify backup compatibility from an exported fixture and document future migration rules.
- [ ] Publish stable release notes, checksums, screenshots, and reproducible release evidence.

Roadmap checkboxes describe completed implementation only when the code exists. Release-verification items remain open until there is build/test evidence; documentation must not convert an unverified target into a completed claim.
