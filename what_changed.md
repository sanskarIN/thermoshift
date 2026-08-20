# ThermoShift 2.8.2 cross-platform continuation handoff

## Candidate identity

- Repository: `sanskarIN/thermoshift`
- Working branch: `build/thermoshift-v0.2` (legacy name retained to preserve PR #11 history)
- Pull request: `#11`
- Base branch: `main`
- Source version: `2.8.2`
- Intended stable tag: `v2.8.2`
- Release state: untagged release candidate

Do not tag, merge as a stable release, or describe `v2.8.2` as release-verified until the exact-candidate hosted/security/browser/native/device/screenshot gates in `docs/release-evidence.md` are satisfied.

## Current platform target set

ThermoShift now has one source architecture targeting:

- Web;
- installable/offline-capable PWA;
- Windows through Tauri 2;
- macOS through Tauri 2;
- Linux through Tauri 2;
- Android through Tauri 2;
- iOS through Tauri 2.

The browser and native products continue to use the canonical Rust temperature domain model. Android and iOS do not contain a second conversion-formula implementation.

## Shared native runtime

The previous desktop-only Tauri entry point was refactored into a reusable native library:

- `apps/desktop/src-tauri/src/lib.rs` owns Tauri command registration and `run()`;
- `run()` carries `#[cfg_attr(mobile, tauri::mobile_entry_point)]`;
- `apps/desktop/src-tauri/Cargo.toml` exposes `staticlib`, `cdylib`, and `rlib` crate types under `thermoshift_lib`;
- `apps/desktop/src-tauri/src/main.rs` delegates to `thermoshift_lib::run()` for desktop execution;
- native commands continue to call `thermoshift-core` for conversion and absolute-zero behavior.

Windows, macOS, Linux, Android, and iOS therefore share the same Rust native runtime boundary.

## Android source/configuration support

Added and enforced:

- `apps/desktop/src-tauri/tauri.android.conf.json`;
- Android minimum SDK 24;
- `android:init`;
- `android:dev`;
- `android:dev:host` for physical/LAN-device development;
- `android:build` producing APK/AAB output;
- `android:run`;
- root workspace wrappers and Make targets;
- Android Studio/SDK/NDK/Java/Rust-target setup documentation;
- hosted Android native verification using Java, Android NDK, Rust ARM64 tooling, and the exact candidate head SHA.

## iOS source/configuration support

Added and enforced:

- `apps/desktop/src-tauri/tauri.ios.conf.json`;
- iOS minimum system version 14.0;
- `ios:init`;
- `ios:dev`;
- `ios:dev:host` for explicit physical-device host development;
- `ios:dev:tunnel` using the forced IP-selection flow;
- `ios:build`;
- `ios:build:simulator` using the Apple Silicon simulator target;
- `ios:run`;
- root workspace wrappers and Make targets;
- Xcode/CocoaPods/Rust-target setup documentation;
- hosted macOS iOS-simulator native verification using the exact candidate head SHA.

Apple development-team IDs, signing certificates, provisioning profiles, private keys, and store credentials are intentionally not committed. Signed Apple distribution remains owner-controlled.

## Mobile development-server support

`apps/web/vite.config.ts` reads `TAURI_DEV_HOST` for mobile development.

When a mobile host is supplied:

- Vite listens on that host;
- application port remains fixed at `5173`;
- `strictPort` is enabled;
- HMR uses the same host on port `5174`.

Ordinary browser/desktop development remains local by default. `scripts/check-mobile-config.mjs` guards these device-host settings so physical-device support cannot silently disappear.

## Hosted Android failure 1: frontend-hook working directory

The first real hosted Android run reached actual Tauri target initialization and successfully completed:

- checkout;
- Node/Java/Rust setup;
- Android NDK resolution;
- locked `npm ci`;
- mobile configuration guard;
- `tauri android init`.

The generated Android Studio project was created successfully. The package build then failed because Tauri executed the old frontend hook:

```text
npm --prefix ../../web run build
```

from the native npm/Tauri CLI working directory `apps/desktop`, incorrectly resolving to repository-level `/web/package.json`.

Fixes:

- `beforeDevCommand` is now `npm --prefix ../web run dev:web`;
- `beforeBuildCommand` is now `npm --prefix ../web run build`;
- `frontendDist` remains `../../web/dist` because Tauri resolves that path from `src-tauri/tauri.conf.json`;
- `scripts/check-desktop-config.mjs` now models both path bases and verifies the target package exists.

## Hosted Android failure 2: WASM exported borrowed string

After the frontend-path fix, exact-candidate Android verification again passed:

- exact candidate checkout;
- Node/Java/Rust/NDK setup;
- locked npm install;
- `check:desktop-config`;
- `check:mobile-config`;
- Android shell initialization;
- execution of the corrected `beforeBuildCommand`;
- compilation of the canonical Rust core and most WASM dependencies.

The production WASM build then surfaced this compiler error in `crates/thermoshift-wasm/src/lib.rs`:

```text
error: cannot return a borrowed ref with #[wasm_bindgen]
23 | pub fn engine_version() -> &'static str {
   |                            ^^^^^^^^^^^^
```

This was a WebAssembly boundary defect exposed by the current hosted wasm-bindgen toolchain, not an Android SDK/NDK failure.

Fixes:

- `engine_version()` now returns an owned `String` using `env!("CARGO_PKG_VERSION").to_owned()`;
- the JavaScript-facing semantic value remains the same;
- a Rust regression test verifies the exported engine version equals `CARGO_PKG_VERSION`.

The next exact-candidate native run must prove that compilation progresses beyond this point; do not treat the older failing SHA as current evidence.

## Cross-platform configuration guards

`npm run check:desktop-config` verifies, among other things:

- frontend distribution path;
- actual native-workspace-relative frontend hook prefixes;
- Tauri development URL;
- minimal capability scope;
- CSP bounds;
- required generated desktop icons.

`npm run check:mobile-config` verifies:

- Android/iOS lifecycle scripts;
- physical-device host/IP-selection scripts;
- root workspace wrappers;
- Tauri identifier `in.sanskar.thermoshift`;
- Android minimum SDK;
- iOS minimum system version;
- no committed Apple `developmentTeam` value;
- `thermoshift_lib` library target;
- `staticlib`, `cdylib`, and `rlib` crate types;
- Tauri mobile entry-point attribute;
- public shared `run()`;
- desktop delegation to the shared runtime;
- Vite `TAURI_DEV_HOST`, strict fixed-port, and HMR host configuration.

Both native guards run in the dedicated mobile workflow before platform initialization/building.

## Exact-candidate mobile verification

`.github/workflows/mobile-platforms.yml` has separate Android and iOS jobs and now runs for every pull-request candidate change. This is intentional: release evidence is tied to the exact candidate SHA, so documentation-only final commits must not bypass native verification.

For pull requests each job uses the PR head SHA as `CANDIDATE_SHA` and explicitly checks out that SHA instead of GitHub's synthetic merge commit.

Android job:

- Ubuntu 24.04;
- Node.js 22;
- Java 17;
- Android NDK resolution;
- Rust WASM + `aarch64-linux-android` targets;
- locked npm install;
- desktop/mobile config guards;
- Tauri Android init;
- ARM64 APK/AAB build;
- `THERMOSHIFT_ANDROID_BUILD.txt` candidate identity record;
- candidate-SHA-qualified native artifact upload.

iOS job:

- macOS 14;
- Node.js 22;
- Rust WASM + iOS device/simulator targets;
- Xcode verification;
- CocoaPods verification;
- locked npm install;
- desktop/mobile config guards;
- Tauri iOS init;
- Apple Silicon simulator build;
- `THERMOSHIFT_IOS_BUILD.txt` candidate identity record;
- candidate-SHA-qualified `gen/apple/build` artifact upload.

Workflow source is not passing evidence. Only completed jobs for the exact final candidate SHA may be recorded as Passed.

## Dependency and lockfile state

The generated `2.8.2` dependency locks have landed.

Confirmed in the branch:

- `package-lock.json` root version is `2.8.2`;
- web workspace lock metadata is `2.8.2`;
- native workspace lock metadata is `2.8.2`;
- `Cargo.lock` records `thermoshift-core` `2.8.2`;
- `Cargo.lock` records `thermoshift-desktop` `2.8.2`;
- `Cargo.lock` records `thermoshift-wasm` `2.8.2`.

The cross-platform continuation changed scripts, Tauri platform configs, source layout, crate output types, Vite/native workflow configuration, WASM return ownership, tests, and documentation, but did not add/change npm or Rust dependency declarations. Do not hand-edit package-manager integrity metadata merely to make the lockfile commit newer.

The hosted `npm ci` output currently reports three high-severity vulnerabilities in the installed dependency tree. Treat the dedicated Dependency Security workflow and an actual audit report as the source of truth for release remediation; do not run a breaking `npm audit fix --force` blindly.

`.github/workflows/lockfiles.yml` is manual-only maintenance and runs version, desktop config, mobile config, and documentation checks before committing an intentional dependency refresh. Its configured Git identity remains Sanskar / `sanskarin@outlook.in`.

## Release/preflight hardening

`scripts/check-release-inputs.mjs` requires the committed cross-platform inputs, including Android/iOS configs, the shared Tauri native library entry point, mobile config checker, mobile verification workflow, and mobile development documentation.

Normal CI and the tagged web-release workflow run `check:mobile-config`; mobile hosted verification additionally runs `check:desktop-config` because Tauri frontend path correctness is required on every native target.

`docs/release-evidence.md` requires candidate-SHA-qualified Android and iOS evidence and explicitly prevents old failed/passed SHAs from being reused after the candidate changes.

## Developer/documentation integration

Cross-platform guidance is maintained in:

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

The Makefile exposes desktop/mobile checks, Android init/dev/device-host/build, and iOS init/dev/device-host/IP-selection/simulator-build targets.

## Existing product/reliability work retained

The earlier 2.8.2 candidate work remains intact, including eight temperature scales, canonical Rust conversion and absolute-zero validation, WebAssembly bridge, instant/batch conversion, searchable/filterable local history, strict bounded backup/restore, reference/formula education, onboarding, keyboard/Quick Actions, PWA offline/update behavior, local-only persistence, redacted diagnostics, accessibility/focus hardening, decimal rounding regression fixes, web asset budgets, Chromium/Firefox/WebKit automation, CodeQL/Gitleaks/RustSec/npm-audit automation, generated desktop icon assets, and release provenance/checksum tooling.

## Cross-platform continuation commits

Initial Android/iOS integration:

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
- `879e33084175e17003f6bad7869f0017a8ce4b71` — `docs/development): document shared native mobile workflow`
- `a6f2f294138a0e4497acd2aa9cbc26f13701586b` — `docs(setup): add Android and iOS prerequisites`
- `bbf1ced7db8b357131279321ef5beeb4d5abd2fa` — `build(make): expose cross-platform native targets`
- `fb0abe804da7b438a9614baca20afa2082fd41d1` — `docs(roadmap): add Android and iOS release gates`
- `4c4d2d83214ed789810ce744ec8b79b41019a9f8` — `docs(testing): cover Android and iOS native verification`
- `901f1e7a2d37b536963d91c19440bd6bf3d4fcab` — `docs(handoff): record 2.8.2 cross-platform checkpoint`

Hosted-build-driven hardening and physical-device support:

- `ac3538a7cbc86577c0cc8ab5a1e994232f807140` — `fix(native): resolve web build from Tauri command cwd`
- `e85a3dcab72f01e844895ff6b57d0f0c2ac586e3` — `test(native): validate command paths from workspace cwd`
- `60e33ca4f12cd1cbe560c8562d292dc08dca6045` — `ci(mobile): verify exact candidate native builds`
- `4785bb22b4df472f1549bf9f7188780d4de5e8dc` — `feat(mobile): expose Vite dev server to Tauri devices`
- `b241b8e8fb291f6f558c4310cff36a8d65e9b3c8` — `feat(mobile): add physical-device dev commands`
- `10831c96990a1fa6a9c7fbb1e8c6a2c1a30554c1` — `feat(workspace): expose physical mobile dev modes`
- `f9e66c5375fa64c73b70b66e1eacabcecc2dda66` — `test(mobile): guard device-host development config`
- `6ab57efb5072fa8cace4f6ad067af001f7972965` — `build(make): add physical mobile dev modes`
- `2f132488f36d3f4bffdd58c8a01dc4f8aa1a4007` — `docs(mobile): document device-host and exact-head workflows`
- `ac41951c0a266ab66c69cd559f582fe3e8c9ada3` — `docs(release): tighten exact-head mobile evidence`
- `830f69d05dc853e8d3cae0b135810bfb1dd18d4d` — `docs(development): add physical-device native workflow`
- `d9c79258648f1509fd7dd7881d2c28dd5cd25586` — `docs(setup): add physical-device mobile setup`
- `e53ae0e1d301ff5ee7c6f14e17f0d43c5b78d28a` — `docs(changelog): record native path and device-host fixes`
- `d01aba5ae51549953f5469ea241024859734a04c` — `ci(mobile): verify every PR candidate head`
- `52605476d142ef0535e14c31f9acf21178eda09b` — `docs(handoff): record hosted cross-platform hardening`
- `517ac4fcf141199db298c2624f8596811788f8a1` — `fix(wasm): return owned engine version string`
- `8982a26121b983ba495e0f6a15d794729c2d95e3` — `test(wasm): cover owned engine version export`
- `45a789ae6d2759d562b496aeae2d56fce94d4c91` — `docs(changelog): record WASM native-build fix`

## Exact-candidate evidence still open

The source architecture/configuration is cross-platform, but these release gates still require evidence for the final candidate SHA:

1. CI metadata/Rust/web/E2E completion.
2. Chromium/Firefox/WebKit compatibility completion.
3. CodeQL, Gitleaks, RustSec, and npm-audit completion.
4. Verified real product screenshot capture/commit.
5. Unsigned Windows native bundle evidence.
6. Unsigned macOS native bundle evidence.
7. Unsigned Linux native bundle evidence.
8. Android native APK/AAB workflow success on the final candidate after the frontend-path and WASM-export fixes.
9. iOS simulator native-build workflow success on the final candidate.
10. Representative Android emulator/device launch, conversion, persistence, responsive/touch/accessibility, and offline smoke evidence.
11. Representative iOS simulator/device launch, conversion, persistence, responsive/touch/accessibility, and offline smoke evidence.
12. Required PWA real browser/device install/offline/update evidence.
13. Review/fix any actual current dependency-security findings; do not automatically force-upgrade around audit output without understanding dependency impact.
14. Owner-controlled native signing/notarization/store publication configuration where distribution requires it.
15. Repository administration/ruleset review where required.
16. Stable tag/publication only after the exact-candidate evidence table is satisfied.

## Continuation order

1. Freeze the current head unless an actual exact-head check failure requires a source/configuration fix.
2. Review `Mobile Platform Verification` for the exact candidate SHA.
3. If Android/iOS fails, inspect concrete job steps/logs and patch the real cause; do not weaken the gate.
4. Review CI, Cross-browser E2E, CodeQL, Gitleaks, RustSec, and npm audit for the same SHA.
5. Capture/review/commit verified product screenshots from the real app; because this changes the candidate SHA, allow all exact-head PR checks including mobile verification to run again.
6. Produce/review Windows/macOS/Linux native evidence for the final SHA.
7. Record representative Android/iOS/PWA device evidence.
8. Update `docs/release-evidence.md` only with completed evidence tied to the final SHA.
9. Create/push `v2.8.2` only after all required gates are satisfied.
10. Verify the published web archive checksum, provenance manifest/checksum, and generated release notes.

Do not create placeholder evidence, hand-author package-manager integrity data, bypass failing quality/security gates, commit signing secrets, or describe an unexecuted workflow as passed.
