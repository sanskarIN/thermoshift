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

## 2.8.2 — Reliability, safety, and release-readiness

### Product/UX implementation

- [x] Add first-run onboarding with local-first privacy guidance.
- [x] Add Quick Actions and keyboard-first page navigation.
- [x] Prevent global page shortcuts from stealing editable/modal interactions.
- [x] Announce client-side page changes, synchronize document titles, and publish keyboard shortcut metadata for assistive technology.
- [x] Add history search, scale filters, individual deletion, clear, and undo.
- [x] Add versioned full-data backup and strict validated restore.
- [x] Bound backup input to 256 KiB before file reading/parsing.
- [x] Reject malformed backup settings/timestamps, duplicate IDs, invalid history, and unsupported schemas rather than silently normalizing imports.
- [x] Distinguish trusted backup-validation failures from unexpected file-read/runtime failures so raw operational error details are not shown in Settings.
- [x] Bound batch conversion to 32,768 characters and 1,000 lines before conversion work.
- [x] Add selectable scale for reference cards.
- [x] Add educational formula derivation notes.
- [x] Externalize English product copy for internationalization-ready UI architecture.
- [x] Add reusable dialog focus containment, escaped-focus recapture, and expanded accessibility regression tests.
- [x] Add PWA update controls without making conversion depend on connectivity.
- [x] Keep startup/update/backup operational errors out of user-facing copy while retaining redacted local diagnostics.
- [x] Keep rejected clipboard/share error details behind the redacted diagnostic boundary and treat native-share cancellation as a normal user action.
- [x] Clean temporary download resources and show localized/redacted failure feedback when batch/history/backup export dispatch fails.
- [x] Harden decimal half-up presentation rounding for binary floating-point edge cases such as `±1.005`.

### Domain/test hardening

- [x] Add dense cross-scale Rust conversion invariants.
- [x] Add Unicode-aware unit parsing and alias/unknown-input regression tests.
- [x] Expand frontend unit/component tests for persistence, backup, update, logging, accessibility, keyboard behavior, bounded batch input, generic handling of unexpected backup file-read errors, clipboard/share capability outcomes, escaped-focus dialog recovery, component download failures, and rounding edges.
- [x] Expand real-WASM browser E2E to cover local history persistence, service-worker offline reload/conversion, Settings/update controls, and axe scans.
- [x] Add Chromium, Firefox, and WebKit compatibility smoke automation with independent engine results.
- [x] Add internal Markdown link validation.
- [x] Add production PWA raw/gzip asset budgets.
- [x] Add dependency-free tests for release-input validation and provenance generation.
- [x] Validate full Git object identity and single-line refs in provenance generation.

### Security/automation implementation

- [x] Add version consistency verification across npm/Rust/Tauri metadata.
- [x] Fix and statically verify Tauri frontend workspace paths.
- [x] Add Gitleaks repository secret scanning alongside CodeQL and dependency audits.
- [x] Add concurrency cancellation to current PR CI/security workflow definitions.
- [x] Expand tagged web release quality gates before publication.
- [x] Add a native-tool lockfile generation workflow with artifact evidence and requested Git author identity.
- [x] Require committed locks in CI, cross-browser, dependency-security, desktop, screenshot, and release-sensitive verification paths.
- [x] Keep lockfile regeneration manual-only outside intentional version/dependency refreshes.
- [x] Add a real-product screenshot capture/validation workflow with SHA-qualified artifact evidence.
- [x] Add an unsigned Windows/macOS/Linux Tauri package verification matrix with candidate-SHA metadata and bundle artifacts.
- [x] Add reproducible desktop icon generation from the editable SVG with SHA-qualified artifact evidence.
- [x] Generate and commit the required primary PNG, Windows ICO, and macOS ICNS desktop icon assets.
- [x] Verify committed primary desktop icon artifacts through the static desktop configuration gate.
- [x] Keep desktop icon regeneration manual-only after generated assets land.
- [x] Add fail-closed release-input preflight requiring lockfiles, complete PNG/ICO/ICNS branding inputs, release documentation, and—at stable-tag time—the verified screenshot set.
- [x] Add cryptographic release provenance manifest generation plus manifest checksum publication.
- [x] Prevent lockfile/icon/screenshot generator workflows from rebasing stale generated evidence onto a newer branch head.
- [x] Add exact-candidate release-evidence and repository-settings guidance.
- [x] Move all enforced source-version metadata to `2.8.2`.

### 2.8.2 release evidence still open

- [ ] Regenerate and commit npm/Cargo lock metadata for the exact `2.8.2` source manifests.
- [ ] Run the verified screenshot workflow; review/commit the real desktop/mobile captures and update README screenshot presentation.
- [ ] Review current-head CI, Cross-browser E2E, CodeQL, Gitleaks, RustSec, and npm-audit workflow results; fix any actual failure rather than inferring success from workflow definitions.
- [ ] Run/review unsigned native bundle evidence on Linux, Windows, and macOS for the exact release candidate.
- [ ] Verify PWA install/offline/update behavior on real target browser/device environments required by the release plan.
- [ ] Configure intended `main` branch protection/rulesets and optional Discussions/labels/milestones in GitHub settings where available.
- [ ] Configure owner-controlled platform signing/notarization credentials before signed desktop publication.
- [ ] Tag/publish `v2.8.2` only after `npm run check:release-inputs:screenshots`, exact-candidate hosted checks, native evidence, and `docs/release-evidence.md` are satisfied.
- [ ] Verify the published archive checksum plus the candidate-SHA/ref provenance manifest and its checksum after the tagged release runs.

## 3.0 — Next major stability milestone

- [ ] Complete clean-checkout verification on Windows, macOS, Linux, Chromium, Firefox, and WebKit.
- [ ] Close all blocker/high-severity defects carried beyond 2.8.2.
- [ ] Verify PWA install/offline/update behavior on representative real desktop and mobile devices.
- [ ] Verify backup compatibility from exported fixtures and document future migration rules.
- [ ] Complete signed/notarized native publication strategy where distribution requires it.
- [ ] Publish stable release notes, checksums, provenance manifest, verified screenshots, and reproducible release evidence.

## Future/optional engineering

- [ ] Add a fuzz target for unit-string/backup parsing if nightly/fuzz infrastructure is adopted and provides useful incremental coverage beyond the existing deterministic invariants/input-boundary tests.
- [ ] Add broader real-device/browser labs when the maintenance cost is justified by supported-user coverage.

Roadmap checkboxes describe implemented code/automation only when the source exists, and completed verification only when evidence exists for the exact candidate. Workflow definitions, source version `2.8.2`, or documentation alone must never be converted into a passing release claim.
