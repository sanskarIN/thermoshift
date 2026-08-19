# Release Process

ThermoShift releases are evidence-driven. A semantic version in source code is not proof that a release candidate is verified, and a successful check from an older commit is not evidence for a newer candidate.

Use [`release-evidence.md`](release-evidence.md) as the exact-candidate evidence record.

## Release checklist

1. Freeze feature work and identify the exact candidate commit SHA.
2. Start from a clean checkout of that candidate with no uncommitted changes.
3. Run `npm run check:versions`, `npm run check:desktop-config`, and `npm run check:docs`.
4. Resolve/install dependencies through the documented package-manager workflow. When committed dependency lockfiles exist, use the locked/reproducible commands documented for the candidate.
5. Build the WASM bridge and run Rust formatting, tests, and Clippy.
6. Run web type checking, ESLint, Vitest coverage, production PWA build, and the enforced web asset budget.
7. Run Playwright E2E/axe tests against the real production/WASM-backed app.
8. Review the candidate's CodeQL, secret-scan, RustSec, and npm-audit results plus relevant dependency/security alerts.
9. Verify local backup export/restore and invalid/oversized-file rejection.
10. Verify keyboard-only navigation, dialog focus behavior, high contrast, reduced motion, zoom, and offline/update PWA behavior.
11. Capture real product screenshots from a verified running build and validate the screenshot set; never substitute mockups and label them as product captures.
12. Build unsigned Tauri packages on Windows, macOS, and Linux using each platform's actual prerequisites. The repository's desktop matrix workflow may provide CI evidence, but it does not create signing credentials.
13. Verify generated platform branding/icon assets exist in the exact candidate.
14. Update `CHANGELOG.md`, `ROADMAP.md`, `README.md`, and `what_changed.md` so they describe the exact candidate and do not overstate unverified platforms/checks.
15. Sign/notarize native artifacts only with owner-controlled credentials stored outside source control.
16. Create an annotated semantic version tag such as `v0.2.0` only after the candidate is approved.
17. Push the tag and verify the automated GitHub web release workflow.
18. Download the published web archive, verify its SHA-256 checksum, and review generated release notes before announcement.

## Automated web release gate

A pushed `vX.Y.Z` tag starts `.github/workflows/release.yml`. The current workflow:

1. checks cross-manifest npm/Rust/Tauri version consistency;
2. checks the Tauri frontend path/configuration contract;
3. checks internal Markdown links;
4. checks that the Git tag exactly equals `v` plus the workspace package version;
5. resolves/installs JavaScript dependencies;
6. checks Rust formatting;
7. runs the canonical Rust test suite;
8. runs Rust Clippy for the core and WASM bridge;
9. runs web TypeScript type checking and ESLint;
10. runs Vitest coverage thresholds;
11. builds the real WASM-backed production PWA;
12. enforces the raw/gzip production asset budget;
13. installs Chromium and runs Playwright E2E/axe checks;
14. packages `apps/web/dist` as `thermoshift-web-vX.Y.Z.tar.gz`;
15. generates a SHA-256 checksum file;
16. creates/updates the GitHub release with generated notes, archive, and checksum.

A mismatched tag or failed quality command stops publication.

The dependency-install step must be changed to the committed locked graph (`npm ci` and Cargo `--locked` where applicable) only after `package-lock.json`/`Cargo.lock` actually exist in the repository candidate. Do not document or configure locked builds by pretending missing lockfiles exist.

## Screenshot evidence workflow

`.github/workflows/screenshots.yml` is the maintained product-capture path. It builds the real PWA/WASM application, runs the dedicated Playwright screenshot suite, validates the exact eight-image set with `npm run check:screenshots`, and can commit changed images using the configured project Git author identity.

Keep this workflow manual for ordinary maintenance. Screenshots are evidence only after the generated PNG files exist in the candidate and the validation step has passed.

## Desktop platform verification

`.github/workflows/desktop-platforms.yml` defines an unsigned package matrix for:

- Ubuntu/Linux;
- Windows;
- macOS.

It verifies repository metadata/configuration, checks the desktop Rust crate, builds the Tauri package, and uploads the native bundle directory as a short-lived workflow artifact. This proves buildability only for jobs that actually complete successfully.

Signing/notarization remains a separate publication gate requiring owner-controlled credentials. Never add signing certificates, private keys, passwords, Apple notarization secrets, or Windows signing secrets to Git.

## Desktop icon generation

The editable branding source is `apps/web/public/logo.svg`. `npm --workspace @thermoshift/desktop run icons` invokes the Tauri icon generator. The `Refresh Desktop Icons` workflow provides a reproducible hosted path and checks the primary Windows/macOS/PNG outputs before committing the generated icon set.

Do not claim platform branding completion until `apps/desktop/src-tauri/icons/` exists in the candidate and the expected generated files are present.

## Dependency lockfile maintenance

See [`dependency-lockfiles.md`](dependency-lockfiles.md). Lockfiles must be generated by npm/Cargo tooling, reviewed, and committed; never hand-write package-manager integrity metadata merely to satisfy a release checklist.

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
