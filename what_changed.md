# ThermoShift 2.8.2 cross-platform continuation handoff

## Candidate identity

- Repository: `sanskarIN/thermoshift`
- Working branch: `build/thermoshift-v0.2` (legacy name retained to preserve PR #11 history)
- Pull request: `#11`
- Base branch: `main`
- Source version: `2.8.2`
- Intended stable tag: `v2.8.2`
- Release state: untagged release candidate; source/configuration support is broader than the currently completed release evidence

Do not tag or describe `v2.8.2` as stable until the exact-candidate hosted/security/browser/native/device/screenshot gates in `docs/release-evidence.md` are satisfied.

## Current platform target set

ThermoShift now has one source architecture targeting:

- Web;
- installable/offline-capable PWA;
- Windows through Tauri 2;
- macOS through Tauri 2;
- Linux through Tauri 2;
- Android through Tauri 2;
- iOS through Tauri 2.

The browser and native products continue to use the canonical Rust temperature domain model. Android and iOS did not receive a second implementation of conversion formulas.

## Cross-platform native runtime completed

The previous desktop-only Tauri entry point was refactored into a reusable native library:

- `apps/desktop/src-tauri/src/lib.rs` now owns Tauri command registration and `run()`;
- `run()` carries `#[cfg_attr(mobile, tauri::mobile_entry_point)]`;
- `apps/desktop/src-tauri/Cargo.toml` exposes `staticlib`, `cdylib`, and `rlib` crate types under `thermoshift_lib`;
- `apps/desktop/src-tauri/src/main.rs` delegates to `thermoshift_lib::run()` for desktop execution;
- the shared native commands continue to call `thermoshift-core` for conversion and absolute-zero behavior.

This gives desktop and mobile targets one Rust native runtime boundary instead of parallel platform implementations.

## Android target completed in source/configuration

Added:

- `apps/desktop/src-tauri/tauri.android.conf.json`;
- explicit Android minimum SDK 24;
- `android:init`;
- `android:dev`;
- `android:build` producing APK/AAB output;
- `android:run`;
- root workspace wrappers for the same commands;
- Android setup/development/release documentation;
- hosted Android native verification using Java/Android NDK/Rust ARM64 tooling.

The hosted Android workflow initializes the Tauri Android shell from the exact candidate and builds ARM64 package output. It uploads candidate-SHA-qualified package evidence only when the job actually succeeds.

## iOS target completed in source/configuration

Added:

- `apps/desktop/src-tauri/tauri.ios.conf.json`;
- explicit iOS minimum system version 14.0;
- `ios:init`;
- `ios:dev`;
- `ios:build`;
- `ios:build:simulator` using the Apple Silicon simulator target;
- `ios:run`;
- root workspace wrappers for the same commands;
- iOS/Xcode/CocoaPods/Rust-target setup documentation;
- hosted macOS iOS-simulator native verification.

Apple development-team IDs, signing certificates, provisioning profiles, private keys, and store credentials are intentionally not committed. Signed Apple distribution remains an owner-controlled release gate.

## Cross-platform configuration guard

`scripts/check-mobile-config.mjs` is now a fail-closed structural gate. It verifies:

- required Android/iOS lifecycle scripts in the native npm workspace;
- required top-level workspace wrappers;
- `check:mobile-config` itself remains wired;
- Tauri identifier remains `in.sanskar.thermoshift`;
- Android minimum SDK remains 24;
- iOS minimum system version remains 14.0;
- no Apple `developmentTeam` value is committed in iOS config;
- `thermoshift_lib` remains exposed as a library target;
- `staticlib`, `cdylib`, and `rlib` crate types remain present;
- the mobile Tauri entry-point attribute remains present;
- the shared `run()` function remains public;
- the desktop binary still delegates to the shared runtime.

This check is now consumed by normal CI, tagged web-release preflight, manual lockfile refresh, documentation/development guidance, and the dedicated mobile workflow.

## Hosted mobile verification workflow

`.github/workflows/mobile-platforms.yml` was added with separate Android and iOS jobs.

Android job:

- Ubuntu 24.04;
- Node.js 22;
- Temurin Java 17;
- Android NDK resolution from hosted-runner environment;
- Rust `wasm32-unknown-unknown` + `aarch64-linux-android` targets;
- locked npm install;
- mobile config guard;
- Tauri Android init;
- ARM64 APK/AAB build;
- candidate-SHA-qualified package evidence upload.

iOS job:

- macOS 14 runner;
- Node.js 22;
- Rust WASM + iOS device/simulator targets;
- Xcode verification;
- CocoaPods verification;
- locked npm install;
- mobile config guard;
- Tauri iOS init;
- Apple Silicon simulator build.

Workflow source is not proof that those builds passed. Review the exact-head jobs before changing Android/iOS evidence from Pending.

## Dependency and lockfile state

The generated `2.8.2` dependency locks have landed and are no longer waiting for the earlier version migration refresh.

Confirmed in the branch:

- `package-lock.json` root version is `2.8.2`;
- web workspace lock metadata is `2.8.2`;
- native/desktop workspace lock metadata is `2.8.2`;
- `Cargo.lock` records `thermoshift-core` `2.8.2`;
- `Cargo.lock` records `thermoshift-desktop` `2.8.2`;
- `Cargo.lock` records `thermoshift-wasm` `2.8.2`.

The cross-platform continuation changed scripts, Tauri platform configs, source layout, docs, and crate output types but did not add/change Rust or npm dependency declarations. Do not hand-edit the lockfiles merely to move their commit timestamp to the latest documentation/source SHA.

The temporary PR-triggered lockfile generator has been removed. `.github/workflows/lockfiles.yml` is restored to a manual-only maintenance workflow and now also runs `check:mobile-config` before committing an intentional dependency refresh.

## Release/preflight hardening for mobile targets

`scripts/check-release-inputs.mjs` now requires the committed cross-platform source/configuration inputs, including:

- Android config;
- iOS config;
- shared Tauri native library entry point;
- mobile config checker;
- mobile verification workflow;
- mobile development documentation.

`.github/workflows/release.yml` now runs `npm run check:mobile-config` before a tagged web artifact can publish.

This does not make the web release job a substitute for native platform verification. Windows/macOS/Linux/Android/iOS build evidence remains recorded separately for the exact candidate.

## Developer workflow/documentation completed

Updated/added cross-platform guidance includes:

- `README.md`;
- `docs/mobile.md`;
- `docs/setup.md`;
- `docs/development.md`;
- `docs/testing.md`;
- `docs/release.md`;
- `docs/release-evidence.md`;
- `ROADMAP.md`;
- `CHANGELOG.md`;
- `Makefile`;
- this handoff.

The Makefile now exposes `mobile-check`, Android init/dev/build, and iOS init/dev/simulator-build entry points while its metadata target includes the mobile configuration guard.

## Existing product/reliability work retained

The earlier 2.8.2 candidate work remains intact, including:

- eight temperature scales;
- canonical Rust conversion and absolute-zero validation;
- WebAssembly browser bridge;
- instant and batch conversion;
- local searchable/filterable history with undo;
- strict bounded backup/restore;
- reference and formula education;
- onboarding;
- Quick Actions and keyboard navigation;
- PWA offline/update behavior;
- local-only persistence and redacted diagnostics;
- accessibility/focus hardening;
- decimal rounding regression fixes;
- web asset budgets;
- Chromium/Firefox/WebKit automation;
- CodeQL/Gitleaks/RustSec/npm-audit automation;
- generated desktop icon assets;
- release input/provenance/checksum tooling.

## Cross-platform continuation commits

Meaningful commits in this continuation include:

- `8421b4a658ae73dc6d204e1747222a2f84fced05` — `feat(mobile): expose Tauri library targets`
- `b0938fc97fe0d586a36afa879a531f1037b6f79c` — `feat(mobile): add shared Tauri runtime entry point`
- `2460959e0565872ca5d3e8fe2145f2eefffb2fd1` — `refactor(runtime): route desktop through shared app library`
- `b552bc2326929f63aa76f233c8b6d991ee3fbc4c` — `feat(mobile): add Android and iOS lifecycle scripts`
- `5cd66900b7c3667d33e51c099b6fdf35fcde428f` — `feat(workspace): expose mobile development commands`
- `dfa18f3442de268b8d395caf57fc5fc3dd81f017` — `feat(android): add platform-specific Tauri config`
- `b88a4afbad6f04e8d77cce215962019b4915077c` — `feat(ios): add platform-specific Tauri config`
- `796574edb50773f5b3e6ce9c0cb14b26777c1de1` — `test(mobile): add cross-platform configuration guard`
- `74554d8746e12c886f86dd19c0100e316ad8726e` — `ci(mobile): guard cross-platform configuration`
- `9e67f30a7485961d7073bfb90f0b7a10da1b2b6c` — `ci(mobile): add Android and iOS native verification`
- `d365dcd38c8b328b0f0cadd383ad49c5f5189417` — `docs(mobile): add Android and iOS development guide`
- `5507c2df8b3287193b1bb6e59509448c288d351d` — `release(mobile): require cross-platform release inputs`
- `edb145a402e7e566f0d17e2a35cca64fc0251714` — `release(mobile): validate native target configuration`
- `e8a1aef109a1e84b7954e2726fc8ed4e92c4fda1` — `docs(bundle): describe full cross-platform target set`
- `e57e39ec26a19c4c0a2ec1c68d01fa8fb578ba96` — `docs(release): add Android and iOS evidence gates`
- `2f9267c94b57eb1ea0e979861656318bf60c7f1c` — `docs(readme): document full cross-platform support`
- `5138b60ef73802dbd7d799bcb14e8f0d364b0197` — `docs(release): define full cross-platform verification`
- `f23c379f5d926ff2b9c87145aa7ad3912f3c7b97` — `docs(changelog): record Android and iOS target work`
- `722940d108a51ed486e5c54fb18a5ee3ea8eb08b` — `ci(lockfiles): restore manual cross-platform refresh`
- `879e33084175e17003f6bad7869f0017a8ce4b71` — `docs(development): document shared native mobile workflow`
- `a6f2f294138a0e4497acd2aa9cbc26f13701586b` — `docs(setup): add Android and iOS prerequisites`
- `bbf1ced7db8b357131279321ef5beeb4d5abd2fa` — `build(make): expose cross-platform native targets`
- `fb0abe804da7b438a9614baca20afa2082fd41d1` — `docs(roadmap): add Android and iOS release gates`
- `4c4d2d83214ed789810ce744ec8b79b41019a9f8` — `docs(testing): cover Android and iOS native verification`

## Exact-candidate evidence still open

The source architecture/configuration is now cross-platform, but these release gates still require real evidence for the final candidate SHA:

1. CI metadata/Rust/web/E2E completion.
2. Chromium/Firefox/WebKit compatibility completion.
3. CodeQL, Gitleaks, RustSec, and npm audit completion.
4. Verified real product screenshot capture/commit.
5. Unsigned Windows native bundle evidence.
6. Unsigned macOS native bundle evidence.
7. Unsigned Linux native bundle evidence.
8. Android native APK/AAB workflow success.
9. iOS simulator native-build workflow success.
10. Representative Android emulator/device launch, conversion, persistence, responsive/touch/accessibility, and offline smoke evidence.
11. Representative iOS simulator/device launch, conversion, persistence, responsive/touch/accessibility, and offline smoke evidence.
12. Required PWA real browser/device install/offline/update evidence.
13. Owner-controlled native signing/notarization/store publication configuration where distribution requires it.
14. Repository administration/ruleset review where required.
15. Stable tag/publication only after the exact-candidate evidence table is satisfied.

## Continuation order

1. Treat the current source/documentation head as frozen unless an actual check failure requires a patch.
2. Review exact-head GitHub Actions runs, including `Mobile Platform Verification`.
3. If a hosted job fails, inspect its concrete job steps/logs and patch the real cause with focused regression/config coverage.
4. Re-run and record exact-head verification after any source fix.
5. Capture/review/commit verified product screenshots from the real app.
6. Produce/review Windows/macOS/Linux/Android/iOS native evidence.
7. Record representative Android/iOS/PWA device evidence.
8. Update `docs/release-evidence.md` only with completed evidence tied to the final SHA.
9. Create/push `v2.8.2` only after all required gates are satisfied.
10. Verify the published web archive checksum, provenance manifest/checksum, and generated release notes.

Do not create placeholder evidence, hand-author package-manager integrity data, bypass failing quality/security gates, commit signing secrets, or describe an unexecuted workflow as passed.
