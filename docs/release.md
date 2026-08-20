# Release Process

ThermoShift releases are evidence-driven. A semantic version in source code is not proof that a release candidate is verified, and a successful check from an older commit is not evidence for a newer candidate.

The active candidate version is `2.8.2`. Use [`release-evidence.md`](release-evidence.md) as the exact-candidate evidence record.

## Release checklist

1. Freeze feature work and identify the exact candidate commit SHA.
2. Start from a clean checkout of that candidate with no uncommitted changes.
3. Run `npm run check:release-inputs:screenshots`; a stable candidate is blocked while required lockfiles, platform configuration/runtime inputs, icon assets, or verified screenshot evidence are missing.
4. Run `npm run check:versions`, `npm run check:desktop-config`, `npm run check:mobile-config`, and `npm run check:docs`.
5. Install JavaScript dependencies from the committed graph with `npm ci --ignore-scripts`.
6. Build the WASM bridge and run Rust formatting, `cargo test --locked -p thermoshift-core`, and locked Clippy for the core/WASM crates.
7. Run web type checking, ESLint, Vitest coverage, production PWA build, and the enforced web asset budget.
8. Run the primary Playwright E2E/axe suite and the Chromium/Firefox/WebKit compatibility suite against the real production/WASM-backed app.
9. Review the candidate's CodeQL, secret-scan, RustSec, and npm-audit results plus relevant dependency/security alerts.
10. Verify local backup export/restore and invalid/oversized-file rejection.
11. Verify keyboard-only navigation, dialog focus behavior, page-change announcements, high contrast, reduced motion, zoom, and offline/update PWA behavior.
12. Review the committed real product screenshots and run `npm run check:screenshots`; never substitute mockups and label them as product captures.
13. Build unsigned Tauri packages on Windows, macOS, and Linux using each platform's actual prerequisites. The desktop matrix workflow provides candidate-SHA-qualified CI artifacts when jobs actually succeed.
14. Run the `Mobile Platform Verification` workflow for the exact candidate. Require a successful Android native APK/AAB build and iOS simulator native build before claiming mobile build verification.
15. Record a representative Android emulator/device launch/conversion smoke test and an iOS simulator/device launch/conversion smoke test, including candidate SHA, OS/device versions, local persistence, and offline conversion behavior.
16. Verify generated platform branding/icon assets exist in the exact candidate, including PNG, ICO, and ICNS outputs.
17. Update `CHANGELOG.md`, `ROADMAP.md`, `README.md`, and `what_changed.md` so they describe the exact candidate and do not overstate unverified platforms/checks.
18. Sign/notarize/store-sign native artifacts only with owner-controlled credentials stored outside source control.
19. Create the annotated semantic version tag `v2.8.2` only after the candidate is approved.
20. Push the tag and verify the automated GitHub web release workflow.
21. Download the published web archive, verify its SHA-256 checksum and provenance manifest/checksum, and review generated release notes before announcement.

## Exact release-input preflight

The dependency-free command:

```bash
npm run check:release-inputs
```

requires the non-empty committed dependency locks, primary generated platform icon set, core manifests/configuration, Android/iOS platform configuration, shared mobile-compatible Tauri runtime, mobile verification/config-guard inputs, and release/security/privacy documentation.

For a stable tagged candidate use:

```bash
npm run check:release-inputs:screenshots
```

which additionally requires the exact eight verified product screenshots.

The preflight is intentionally fail-closed. Missing generated evidence is a release blocker, not a reason to create placeholder files.

## Exact-head generated evidence invariant

Generated release inputs must describe the exact source revision that produced them.

The lockfile, desktop-icon, and screenshot maintenance workflows therefore never rebase generated artifacts onto a newer branch head. After creating their generated commit they compare its parent SHA with the current remote branch head. If the branch advanced, the workflow fails and must be rerun from the new head.

This rule prevents:

- lockfiles generated from older manifests being attached to newer dependency declarations;
- icons generated from an older logo being attached to newer branding source;
- screenshots rendered from an older UI being attached to newer application source.

A concurrent documentation or code change is still a candidate change. Regenerate evidence rather than assuming the change is harmless.

## Automated web release gate

A pushed `vX.Y.Z` tag starts `.github/workflows/release.yml`. The current workflow:

1. requires exact release inputs plus the verified screenshot set;
2. checks cross-manifest npm/Rust/Tauri version consistency;
3. checks the Tauri desktop frontend path/configuration contract;
4. checks the Android/iOS shared-runtime and platform-configuration contract;
5. checks internal Markdown links;
6. checks that the Git tag exactly equals `v` plus the workspace package version;
7. installs the committed JavaScript dependency graph with `npm ci --ignore-scripts`;
8. checks Rust formatting;
9. runs the canonical Rust test suite with Cargo `--locked`;
10. runs locked Rust Clippy for the core and WASM bridge;
11. runs web TypeScript type checking and ESLint;
12. runs Vitest coverage thresholds;
13. builds the real WASM-backed production PWA;
14. enforces the raw/gzip production asset budget;
15. validates the committed screenshot evidence;
16. installs Chromium, Firefox, and WebKit with their runner dependencies;
17. runs the primary Playwright E2E/axe checks;
18. runs the Chromium/Firefox/WebKit compatibility gate;
19. packages `apps/web/dist` as `thermoshift-web-vX.Y.Z.tar.gz`;
20. generates a SHA-256 checksum file;
21. generates a candidate-SHA/ref provenance manifest and its SHA-256 checksum;
22. creates/updates the GitHub release with generated notes and the archive/checksum/provenance files.

A mismatched tag, missing generated evidence, dependency-lock mismatch, invalid desktop/mobile config, failed browser engine, or failed quality command stops web publication.

Native bundle publication is intentionally separate from the web archive job. Exact-candidate desktop/mobile build evidence and signing/store publication gates remain mandatory before describing a release as verified on those platforms.

## Screenshot evidence workflow

`.github/workflows/screenshots.yml` is the maintained product-capture path. It first requires the non-screenshot release inputs, installs the committed npm graph with `npm ci`, builds the real PWA/WASM application, runs the dedicated Playwright screenshot suite, validates the exact eight-image set with `npm run check:screenshots`, uploads a candidate-SHA-qualified artifact, and can commit changed images using the configured project Git author identity.

Before pushing a generated screenshot commit, the workflow verifies that the remote branch still points to the exact source commit used for capture. If the branch moved, the workflow fails and the captures must be regenerated on the new head.

Keep this workflow manual for ordinary maintenance. Screenshots are evidence only after the generated PNG files exist in the candidate and validation has passed.

## Desktop platform verification

`.github/workflows/desktop-platforms.yml` defines an unsigned package matrix for:

- Ubuntu/Linux;
- Windows;
- macOS.

Each job:

- requires the exact non-screenshot release inputs;
- installs the committed npm graph;
- verifies metadata/configuration/documentation;
- checks the desktop Rust crate with Cargo `--locked`;
- builds the Tauri package;
- writes `THERMOSHIFT_BUILD.txt` containing candidate SHA/ref/platform metadata;
- uploads a candidate-SHA-qualified native bundle artifact.

A successful build on one operating system is not evidence for the other two.

## Mobile platform verification

`.github/workflows/mobile-platforms.yml` defines native verification for Android and iOS using the same Tauri/Rust runtime as desktop.

The Android job runs on Ubuntu and:

- installs Node 22 and Java 17;
- resolves an installed Android NDK;
- installs the Rust `aarch64-linux-android` target plus the WASM target;
- installs the committed npm dependency graph;
- runs `npm run check:mobile-config`;
- initializes the Tauri Android project;
- builds an ARM64 APK and AAB;
- uploads candidate-SHA-qualified Android package evidence.

The iOS job runs on macOS and:

- verifies Xcode and CocoaPods;
- installs the Rust iOS device/simulator targets plus the WASM target;
- installs the committed npm dependency graph;
- runs `npm run check:mobile-config`;
- initializes the Tauri iOS project;
- builds the Apple Silicon iOS simulator target.

A successful workflow is native compilation/package evidence, not a substitute for representative Android/iOS launch testing. Signed Android/iOS store publication also remains a separate owner-controlled gate.

Never add Android signing keys, Apple certificates/private keys, provisioning profiles, development-team secrets, passwords, notarization secrets, or store credentials to Git. Apple team selection should be supplied through the build environment when a signed Apple build is intentionally produced.

See [`mobile.md`](mobile.md) for local prerequisites and development commands.

## Desktop icon generation

The editable branding source is `apps/web/public/logo.svg`. `npm --workspace @thermoshift/desktop run icons` invokes the Tauri icon generator. The manual `Refresh Desktop Icons` workflow provides a reproducible hosted path and requires primary PNG, Windows ICO, and macOS ICNS outputs before committing the generated set.

Before pushing a generated icon commit, the workflow verifies that the remote branch still points to the exact source commit containing the logo/config used for generation. A branch advance requires regeneration; generated branding is never rebased forward.

The generated artifact name is candidate-SHA-qualified. Do not claim platform branding completion until the required files actually exist and are non-empty in the candidate.

## Dependency lockfile maintenance

See [`dependency-lockfiles.md`](dependency-lockfiles.md). Lockfiles must be generated by npm/Cargo tooling, reviewed, and committed; never hand-write package-manager integrity metadata merely to satisfy a release checklist.

The manual hosted generator verifies version consistency, desktop/mobile Tauri configuration, generated icon integrity, and documentation links before committing and stores candidate-SHA-qualified artifact evidence. Before pushing, it verifies that the remote branch has not advanced from the manifest revision used to generate the dependency graphs. If it has, regenerate on the new head instead of rebasing stale lockfiles.

For `2.8.2`, the committed locks must remain aligned with the exact final dependency manifests. Documentation, scripts, and Tauri target-shape changes that do not modify dependencies do not justify hand-editing package-manager metadata.

## Version consistency

Run:

```bash
npm run check:versions
```

The script verifies version equality across:

- root `package.json`;
- web and desktop npm workspaces;
- core, WASM, and native Tauri Rust packages;
- Tauri product configuration.

When preparing the next version, update all of these in small reviewable commits and keep the version checker green.

## Repository settings

Recommended branch protection, Discussions, label, milestone, and security-feature configuration is documented in [`repository-settings.md`](repository-settings.md). Those settings live in GitHub administration; documentation must not claim they are enabled until repository settings are actually configured.
