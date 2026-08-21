# ThermoShift Handoff — what_changed.md

## Current milestone

**Version:** 0.1.0 development baseline  
**Phase:** Core/web/native implementation is cross-platform at source/configuration level for browsers/PWA, Windows, macOS, Linux, Android, and iOS/iPadOS. The cross-platform continuation is merged to `main`; pull request #13 is hardening clean CI, dependency reproducibility, browser compatibility, and release automation before the first public release.

## Merge checkpoint

- Cross-platform pull request **#12** was merged to `main` on 2026-08-20.
- Pull request #12 preserved **26 granular commits** across **24 changed files**.
- Merge commit: `421c409f81dcff9f86cc9ce90e3830f9d43a4276`.
- The pull request was mergeable and 0 commits behind `main` when reviewed.
- CI, CodeQL, and Dependency Security workflow runs were created for the reviewed head but were still queued at merge time; this file does not retroactively claim they had passed.

## Pull request #13 — CI, security, and reproducibility hardening

Pull request **#13** (`fix/ci-security-hardening`) remains open until its final head has adequate live GitHub Actions evidence. This continuation intentionally fixes failures surfaced by hosted CI instead of weakening or bypassing the checks.

### Live-CI repairs completed

- Fixed the WebAssembly bridge for current `wasm-bindgen` by returning an owned engine version string.
- Applied the exact `rustfmt` output required by hosted CI to the shared Tauri runtime.
- Corrected absolute-zero tests/error semantics for reversed scales such as Delisle.
- Fixed browser share capability detection and clarified the UI boundary as absolute zero.
- Removed the vulnerable optional PWA asset-generator dependency path and moved `vite-plugin-pwa` to the 1.3.x line.
- Expanded typed ESLint coverage to the Vite/Playwright TypeScript project and included E2E specs in the tooling tsconfig.
- Fixed strict async lint violations in presentation/install-prompt tests and removed unnecessary CSV quote escapes.
- Lowered the production browser build target to ES2020/Safari 14 so the Web/PWA artifact aligns with the configured iOS/iPadOS 14 minimum.

### Reproducible dependency inputs completed

- Declared the supported Node 22/npm 10.9 toolchain through `packageManager`, `engines`, `.nvmrc`, and npm configuration.
- Generated and committed both `package-lock.json` and `Cargo.lock` from a clean GitHub-hosted workflow run.
- The lockfile materialization run regenerated npm/Cargo resolutions, uploaded the generated artifacts, committed them to the same-repository repair branch, and then passed its lockfile-currentness check.
- Restored the lockfile verifier to read-only repository permissions immediately after materialization.
- Switched normal Web/E2E CI installs to `npm ci --ignore-scripts`.
- Switched canonical Rust tests and Clippy in CI to Cargo `--locked`.
- Switched dependency-security checks to audit the committed dependency graph instead of silently generating a new one.
- Switched tagged Web release packaging to `npm ci --ignore-scripts`.

### Workflow hardening completed

- Updated `actions/checkout` and `actions/setup-node` to their v5 Node-24-runtime action lines.
- Added per-ref workflow concurrency so superseded CI, CodeQL, dependency-audit, and lockfile runs cancel automatically.
- Preserved read-only permissions for ordinary CI/verification jobs and write permission only where a tagged release actually requires release publication.

### Verification evidence so far

Hosted runs on repair-branch heads have already demonstrated:

- `cargo fmt --all -- --check`: passed.
- canonical Rust tests: passed on a hosted runner before locked-mode conversion.
- Clippy for the canonical engine/WASM bridge: passed on a hosted runner before locked-mode conversion.
- WebAssembly build through `wasm-pack`: passed.
- TypeScript project build/typecheck: passed.
- npm dependency resolution after removing the vulnerable PWA asset-generator path: 0 reported vulnerabilities.
- RustSec dependency audit: passed on an earlier repair head.
- `npm audit --audit-level=high`: passed on an earlier repair head.
- native cross-platform configuration invariant check: passed.
- CodeQL JavaScript/TypeScript analysis: passed on an earlier repair head.
- Lockfile generation/materialization/currentness workflow: passed and committed both lockfiles.

The final documentation/locked-install head still requires its own complete GitHub Actions result before merge. Earlier green results are evidence for the individual repaired layers, not a substitute for final-head verification.

## Completed foundation

- Preserved the repository's MIT license and initial history.
- Added the canonical dependency-free Rust temperature engine for Celsius, Fahrenheit, Kelvin, Rankine, Réaumur, Delisle, Newton, and Rømer.
- Added absolute-zero/non-finite validation plus Rust reference, round-trip, boundary, and invalid-input tests.
- Added the `wasm-bindgen` bridge so browser conversion behavior comes from the Rust engine rather than duplicated TypeScript formulas.
- Added the React/TypeScript/Vite PWA with instant conversion, swap, precision/rounding, copy/share, batch conversion, CSV export, local history, JSON export, formula/reference education, offline state, themes, high contrast, reduced motion, keyboard shortcuts, local data reset, About/support surfaces, and the `Made by the Sanskar` credit.
- Added Vitest, Testing Library, Playwright, axe, GitHub Actions, CodeQL, dependency auditing, Dependabot, release automation, community templates, and repository documentation.
- Added the original Tauri 2 native target for Windows, macOS, and Linux.
- Merged the original implementation as pull request #1 while preserving its granular feature history.

## Cross-platform continuation completed on 2026-08-20

### Shared native runtime

- Converted the Tauri crate into a shared native library with `staticlib`, `cdylib`, and `rlib` crate types.
- Moved Tauri command registration/setup into `apps/desktop/src-tauri/src/lib.rs`.
- Added `#[cfg_attr(mobile, tauri::mobile_entry_point)]` to the shared `run()` function so the same native runtime supports Android and iOS.
- Reduced desktop `main.rs` to a thin delegate to `thermoshift_lib::run()` so desktop and mobile cannot silently diverge.
- Preserved the canonical `thermoshift-core` engine as the only executable source of temperature conversion formulas.

### Android and iOS delivery

- Added root/workspace commands for Android initialization, emulator/device development, host-network development, execution, APK generation, AAB generation, and normal builds.
- Added root/workspace commands for iOS initialization, simulator/device development, host-network development, execution, signed builds, and unsigned CI-oriented builds.
- Configured Android API 24 as the native minimum and added a debug application ID suffix.
- Configured iOS/iPadOS 14.0 as the native minimum system version.
- Added mobile-aware `TAURI_DEV_HOST` handling to Vite so physical devices can reach the development server and HMR over the local network.
- Kept generated `src-tauri/gen/android` and `src-tauri/gen/apple` projects out of this source-only change; they must be generated by the installed Tauri CLI on a real Android/Xcode toolchain rather than fabricated.

### PWA/mobile experience

- Expanded PWA manifest metadata for standalone installation and device-class compatibility.
- Added browser install-prompt lifecycle handling and a visible **Install app** action when `beforeinstallprompt` is available.
- Added standalone-mode detection, accepted/dismissed install outcomes, and `appinstalled` handling.
- Added `viewport-fit=cover`, Apple/mobile standalone metadata, mobile color-scheme metadata, safe-area insets, dynamic viewport sizing, 44px minimum interactive targets, touch manipulation behavior, momentum table scrolling, and coarse-pointer hover protection.

### Quality and CI

- Added `scripts/verify-native-config.mjs`, a dependency-free structural verifier for the native application identifier, Android/iOS minimum versions, Android/iOS lifecycle scripts, Rust library crate types, Tauri mobile entry point, shared `run()`, and desktop delegation.
- Added `npm run verify:native-config` at the workspace root.
- Added a CI `repository-config` job and made E2E depend on that invariant check in addition to the Rust/web jobs.
- Added install-prompt unit tests for acceptance, dismissal, and completion.

### Documentation

- Added `docs/mobile.md` with Android Studio/SDK/NDK setup, Rust targets, Android init/dev/APK/AAB commands, iOS/Xcode/Rust target setup, iOS init/dev/build commands, signing boundaries, PWA installation, troubleshooting, and mobile release checklist.
- Expanded `README.md`, `docs/setup.md`, `docs/release.md`, and `docs/architecture.md` for Android/iOS and the shared native runtime.
- Added ADR 0004 documenting the decision to share one Tauri runtime across desktop and mobile.
- Updated `CHANGELOG.md` and `ROADMAP.md` so configured platform support is clearly distinguished from release-verified packages.

## Current supported target matrix

| Platform | Delivery | Repository state |
|---|---|---|
| Modern browsers | React + Rust/WASM | Implemented |
| Installable PWA | Vite PWA | Implemented |
| Windows | Tauri 2 | Configured native target |
| macOS | Tauri 2 | Configured native target |
| Linux | Tauri 2 | Configured native target |
| Android 7.0+ / API 24+ | Tauri 2 mobile | Configured native target |
| iOS/iPadOS 14+ | Tauri 2 mobile | Configured native target; build host must be macOS/Xcode |

A configured native target is not called release-verified until its real package has been built and smoke-tested on the appropriate toolchain.

## Tests and verification present

- Rust canonical reference-point tests.
- Cross-scale round-trip tests across all eight units.
- Absolute-zero boundary tests for all units, including reversed-scale semantics.
- Non-finite input rejection tests.
- TypeScript rounding/formatting tests.
- Local-storage resilience/reset/history-limit tests.
- React startup component test.
- PWA install-prompt lifecycle tests.
- Playwright real conversion smoke test.
- Playwright + axe primary-screen accessibility test.
- Dependency-free native configuration invariant check.
- Lockfile regeneration/currentness verification.

## Verification boundary in this continuation

- GitHub repository writes, branch comparison, workflow inspection, and pull-request maintenance are performed through the connected GitHub repository integration.
- GitHub-hosted Actions provide the clean dependency/toolchain evidence used for this repair branch; results are recorded only after jobs actually complete.
- A real Android SDK/NDK, Xcode/iOS SDK, signed-store environment, and all desktop packaging hosts are not available in this repository-editing environment, so native package/device/signing verification is not fabricated.
- The structural native verifier remains a source/configuration check; it does not substitute for an APK/AAB, Apple archive, or desktop package built on the appropriate host.

## Known release blockers / remaining verification

1. Complete CI, CodeQL, Dependency Security, and Lockfile Verification successfully on the final pull request #13 head after all locked-install/documentation commits.
2. Run the newly reachable Vitest coverage, production Web build, and Playwright desktop/Pixel accessibility flows successfully in hosted CI; repair any failures they expose.
3. Run `tauri android init` on a configured Android development machine, then build/test APK and AAB outputs on emulator and real hardware.
4. Run `tauri ios init` on macOS with Xcode, then build/test simulator/device outputs and verify signing/provisioning separately.
5. Build and smoke-test Tauri packages on Windows, macOS, and Linux.
6. Capture real screenshots and package evidence from verified builds; do not use fabricated screenshots as release proof.
7. Configure owner-controlled signing/notarization/store credentials before publishing signed native packages.
8. Configure branch protection/required checks if repository settings allow it.
9. Prepare `v0.1.0` only after the platform verification matrix is complete enough for the claims in its release notes.

## Migration notes

There is no database or remote migration. Local storage keys remain `thermoshift.settings.v1` and `thermoshift.history.v1`. Future schema changes must migrate/version existing local data explicitly.

## Release notes draft

ThermoShift 0.1 is a local-first, multi-scale temperature converter with a canonical Rust engine, WebAssembly-powered React PWA, shared Tauri 2 native runtime for Windows/macOS/Linux/Android/iOS, offline installation, local history and batch/export tools, formula/reference education, accessibility preferences, mobile-safe layouts, reproducible dependency inputs, and professional CI/security/documentation foundations.

## Pull request #13 continuation commit checkpoint

- `6a41a86` — `fix(web): lint browser and tooling TypeScript projects`
- `4a27fa7` — `fix(web): include Playwright specs in tooling tsconfig`
- `6baeace` — `fix(web): make engine mock promise explicit`
- `661b7fb` — `fix(web): await React install prompt test updates`
- `56b20ea` — `fix(web): remove unnecessary CSV quote escapes`
- `3afdc2d` — `fix(web): target Safari 14 compatible output`
- `665833d` — `fix(web): keep install prompt test act callbacks synchronous`
- `17a3532` — `ci: materialize generated lockfiles on repair branch`
- `30aa103` — `build: commit reproducible dependency lockfiles`
- `88aa32f` — `ci: restore lockfile verification to read-only`
- `2215b31` — `ci: enforce committed dependency lockfiles`
- `da20561` — `ci(security): audit committed dependency lockfiles`
- `b055bba` — `ci(release): install npm dependencies from lockfile`
- `80fbf6f` — `docs(testing): document locked dependency verification`
- `9c8c8fb` — `docs(setup): prefer reproducible lockfile installs`
- `07a377e` — `docs(release): require locked dependency inputs`
- `c148e04` — `docs(changelog): record reproducibility and CI repairs`

## Cross-platform continuation commit checkpoint

- `83185fe` — `build(native): enable shared library targets for mobile`
- `a50c29a` — `refactor(native): share Tauri runtime across desktop and mobile`
- `702f5b9` — `refactor(native): keep desktop entrypoint thin`
- `f27e0bb` — `build(native): add Android and iOS lifecycle commands`
- `2c78d32` — `build: expose cross-platform native commands at workspace root`
- `2cdeba9` — `build(web): support Tauri mobile dev hosts and richer PWA metadata`
- `fe4d7f6` — `feat(native): configure Android and iOS bundle targets`
- `f3f41f8` — `feat(web): add mobile viewport and standalone app metadata`
- `5e06b7e` — `feat(web): harden touch targets and mobile safe-area layouts`
- `4349f1d` — `feat(web): add install-prompt lifecycle hook`
- `5625d0c` — `i18n: add install action copy`
- `6aacfc2` — `feat(web): surface install action when PWA installation is available`
- `11b2acb` — `style(web): integrate install control into responsive navigation`
- `c807f55` — `test(web): cover install prompt acceptance dismissal and completion`
- `4c74bd8` — `test(native): add cross-platform configuration invariant check`
- `debe65e` — `build: expose native configuration verification command`
- `e0cc208` — `ci: verify cross-platform native configuration invariants`
- `4ecde44` — `docs: add complete Android iOS and mobile PWA guide`
- `3c38742` — `docs: document complete cross-platform support and commands`
- `896f60a` — `docs: expand setup for Android iOS and native verification`
- `95acbb6` — `docs: define cross-platform release verification and signing gates`
- `b6b36a3` — `docs: align architecture with shared desktop and mobile runtime`
- `5043275` — `docs(adr): record shared Tauri desktop and mobile runtime decision`
- `6f8202c` — `docs: advance roadmap for cross-platform native delivery`
- `f23da6c` — `docs: record cross-platform native and mobile PWA improvements`
- `83d1cb1` — `docs: update cross-platform implementation handoff`
- `421c409` — merge commit for pull request #12

This file is the authoritative continuation checkpoint. GitHub history and completed workflow results remain the source of truth for exact final hashes and verification status.