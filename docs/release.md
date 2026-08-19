# Release Process

ThermoShift releases are evidence-driven. A semantic version in source code is not proof that a release candidate is verified, and a successful check from an older commit is not evidence for a newer candidate.

Use [`release-evidence.md`](release-evidence.md) as the exact-candidate evidence record.

## Release checklist

1. Freeze feature work and identify the exact candidate commit SHA.
2. Start from a clean checkout of that candidate with no uncommitted changes.
3. Run `npm run check:release-inputs:screenshots`; a stable candidate is blocked while required lockfiles, platform icon assets, or verified screenshot evidence are missing.
4. Run `npm run check:versions`, `npm run check:desktop-config`, and `npm run check:docs`.
5. Install JavaScript dependencies from the committed graph with `npm ci --ignore-scripts`.
6. Build the WASM bridge and run Rust formatting, `cargo test --locked -p thermoshift-core`, and locked Clippy for the core/WASM crates.
7. Run web type checking, ESLint, Vitest coverage, production PWA build, and the enforced web asset budget.
8. Run Playwright E2E/axe tests against the real production/WASM-backed app.
9. Review the candidate's CodeQL, secret-scan, RustSec, and npm-audit results plus relevant dependency/security alerts.
10. Verify local backup export/restore and invalid/oversized-file rejection.
11. Verify keyboard-only navigation, dialog focus behavior, high contrast, reduced motion, zoom, and offline/update PWA behavior.
12. Review the committed real product screenshots and run `npm run check:screenshots`; never substitute mockups and label them as product captures.
13. Build unsigned Tauri packages on Windows, macOS, and Linux using each platform's actual prerequisites. The repository's desktop matrix workflow provides candidate-SHA-qualified CI artifacts when jobs actually succeed.
14. Verify generated platform branding/icon assets exist in the exact candidate, including PNG, ICO, and ICNS outputs.
15. Update `CHANGELOG.md`, `ROADMAP.md`, `README.md`, and `what_changed.md` so they describe the exact candidate and do not overstate unverified platforms/checks.
16. Sign/notarize native artifacts only with owner-controlled credentials stored outside source control.
17. Create an annotated semantic version tag such as `v0.2.0` only after the candidate is approved.
18. Push the tag and verify the automated GitHub web release workflow.
19. Download the published web archive, verify its SHA-256 checksum, and review generated release notes before announcement.

## Exact release-input preflight

The dependency-free command:

```bash
npm run check:release-inputs
```

requires the non-empty committed dependency locks, primary generated platform icon set, core manifests/configuration, and release/security/privacy documentation.

For a stable tagged candidate use:

```bash
npm run check:release-inputs:screenshots
```

which additionally requires the exact eight verified product screenshots.

The preflight is intentionally fail-closed. Missing generated evidence is a release blocker, not a reason to create placeholder files.

## Automated web release gate

A pushed `vX.Y.Z` tag starts `.github/workflows/release.yml`. The current workflow:

1. requires exact release inputs plus the verified screenshot set;
2. checks cross-manifest npm/Rust/Tauri version consistency;
3. checks the Tauri frontend path/configuration contract;
4. checks internal Markdown links;
5. checks that the Git tag exactly equals `v` plus the workspace package version;
6. installs the committed JavaScript dependency graph with `npm ci --ignore-scripts`;
7. checks Rust formatting;
8. runs the canonical Rust test suite with Cargo `--locked`;
9. runs locked Rust Clippy for the core and WASM bridge;
10. runs web TypeScript type checking and ESLint;
11. runs Vitest coverage thresholds;
12. builds the real WASM-backed production PWA;
13. enforces the raw/gzip production asset budget;
14. validates the committed screenshot evidence;
15. installs Chromium and runs Playwright E2E/axe checks;
16. packages `apps/web/dist` as `thermoshift-web-vX.Y.Z.tar.gz`;
17. generates a SHA-256 checksum file;
18. creates/updates the GitHub release with generated notes, archive, and checksum.

A mismatched tag, missing generated evidence, dependency-lock mismatch, or failed quality command stops publication.

## Screenshot evidence workflow

`.github/workflows/screenshots.yml` is the maintained product-capture path. It first requires the non-screenshot release inputs, installs the committed npm graph with `npm ci`, builds the real PWA/WASM application, runs the dedicated Playwright screenshot suite, validates the exact eight-image set with `npm run check:screenshots`, uploads a candidate-SHA-qualified artifact, and can commit changed images using the configured project Git author identity.

The screenshot commit step rebases once onto the newest branch head before pushing so a concurrent documentation commit cannot discard valid generated captures.

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

Signing/notarization remains a separate publication gate requiring owner-controlled credentials. Never add signing certificates, private keys, passwords, Apple notarization secrets, or Windows signing secrets to Git.

## Desktop icon generation

The editable branding source is `apps/web/public/logo.svg`. `npm --workspace @thermoshift/desktop run icons` invokes the Tauri icon generator. The `Refresh Desktop Icons` workflow provides a reproducible hosted path and requires primary PNG, Windows ICO, and macOS ICNS outputs before committing the generated set.

The generated artifact name is candidate-SHA-qualified, and the commit step rebases once before pushing to avoid losing valid icon output to a concurrent branch update.

Do not claim platform branding completion until the required files actually exist and are non-empty in the candidate.

## Dependency lockfile maintenance

See [`dependency-lockfiles.md`](dependency-lockfiles.md). Lockfiles must be generated by npm/Cargo tooling, reviewed, and committed; never hand-write package-manager integrity metadata merely to satisfy a release checklist.

The hosted generator verifies version consistency, Tauri frontend paths, and documentation links before committing, stores candidate-SHA-qualified artifact evidence, and rebases once before its branch push.

## Version consistency

Run:

```bash
npm run check:versions
```

The script verifies version equality across:

- root `package.json`;
- web and desktop npm workspaces;
- core, WASM, and desktop Rust packages;
- Tauri product configuration.

When preparing the next version, update all of these in small reviewable commits and keep the version checker green.

## Repository settings

Recommended branch protection, Discussions, label, milestone, and security-feature configuration is documented in [`repository-settings.md`](repository-settings.md). Those settings live in GitHub administration; documentation must not claim they are enabled until repository settings are actually configured.
