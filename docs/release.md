# Release Process

ThermoShift releases must be evidence-driven. A semantic version in source code is not by itself proof that a release candidate is verified.

## Release checklist

1. Start from a clean checkout of `main` with no uncommitted changes.
2. Install dependencies and build the WASM bridge using documented setup commands.
3. Run `npm run check:versions` and confirm npm, Rust, Tauri, and workspace versions agree.
4. Run Rust formatting, Clippy, Rust tests, web type checks, ESLint, Vitest coverage, production PWA build, and Playwright tests.
5. Review dependency/security alerts and ensure no blocker/high-severity findings remain unresolved.
6. Verify local backup export/restore and invalid-file rejection.
7. Verify keyboard-only navigation, dialog focus behavior, contrast, reduced motion, zoom, and offline PWA behavior.
8. Update `CHANGELOG.md`, `ROADMAP.md`, and `what_changed.md` so they describe the exact candidate.
9. Capture real screenshots from the verified release build; never substitute mockups and label them as product screenshots.
10. Build desktop installers on Windows, macOS, and Linux using their required native prerequisites.
11. Sign/notarize native artifacts only with owner-controlled credentials stored outside source control.
12. Create an annotated semantic version tag such as `v0.2.0` only after the candidate is approved.
13. Push the tag and verify the automated GitHub release workflow.
14. Verify published artifact checksums and release notes before announcing the release.

## Automated web release gate

A pushed `vX.Y.Z` tag starts `.github/workflows/release.yml`. The workflow:

1. checks that all tracked npm/Rust/Tauri manifest versions are identical;
2. checks that the Git tag exactly equals `v` plus the workspace package version;
3. resolves project dependencies;
4. runs the canonical Rust test suite;
5. runs web type checking, ESLint, and Vitest coverage;
6. builds the production PWA through the real WASM bridge;
7. packages the web distribution as `thermoshift-web-vX.Y.Z.tar.gz`;
8. generates a SHA-256 checksum file;
9. creates/updates the GitHub release with generated notes and both files.

A mismatched tag or failed quality command stops publication.

## Desktop release status

The current automated GitHub release workflow publishes the verified web artifact only. Native Tauri builds remain a manual/native-platform release gate until repository owners configure signing, notarization, and secure secrets for each operating system.

Do not add signing certificates, private keys, passwords, notarization credentials, or generated secrets to Git.

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
