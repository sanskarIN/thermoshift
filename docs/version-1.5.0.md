# ThermoShift 1.5.0 Preparation

ThermoShift 1.5.0 is a release target, not a release claim. The version may be published only after the evidence below is complete enough to support every platform and feature claim in the release notes.

## Release goals

1. Preserve the canonical Rust temperature engine as the only executable conversion source of truth.
2. Keep the Web/PWA and Tauri desktop/mobile shells local-first and account-free.
3. Finish the CI, security, lockfile, coverage, production-build, and E2E hardening inherited from the 0.1 development line.
4. Add the browser-extension delivery target without duplicating conversion formulas or requesting unnecessary browser permissions.
5. Selectively port proven reliability and usability improvements from experimental branches only when they pass the hardened test suite.
6. Produce reproducible release inputs and platform-specific verification evidence.

## Required automated gates

The final 1.5.0 candidate must pass on the same commit:

- `npm run verify:versions`;
- `npm run verify:native-config`;
- `cargo fmt --all -- --check`;
- `cargo test --locked -p thermoshift-core`;
- Clippy with warnings denied for the canonical engine and WASM bridge;
- WebAssembly production compilation;
- TypeScript type checking;
- ESLint with zero warnings;
- Vitest unit/component tests with the configured coverage thresholds;
- production Web/PWA build;
- Playwright conversion and accessibility E2E flows;
- dependency-security audits;
- CodeQL analysis;
- npm and Cargo lockfile verification;
- browser-extension manifest/build invariants when the extension is included in the candidate.

No threshold may be lowered merely to make a release candidate pass.

## Planned 1.5.0 product work

### Reliability and data

- Versioned backup/restore with schema validation and explicit migration boundaries.
- Safer destructive actions and recoverable history operations where practical.
- Update-state handling for installed PWA users.
- Error surfaces that avoid exposing low-level browser/runtime details.

### Productivity and accessibility

- First-run onboarding that does not block keyboard or assistive-technology users.
- Quick actions/keyboard navigation with focus management.
- Expanded history filtering and management.
- Continued high-contrast, reduced-motion, touch-target, safe-area, and screen-reader verification.

### Browser extension

- Manifest V3 baseline with no host permissions and no optional permissions unless a future feature has a reviewed need.
- Popup conversion backed by the same Rust/WASM engine as the Web app.
- Chromium verification first, then Firefox compatibility verification.
- Packaged unsigned artifacts for CI evidence before any store-signing work.

### Release engineering

- Consistent 1.5.0 metadata across npm packages, Rust crates, and Tauri configuration.
- Reproducible npm/Cargo lockfiles.
- Cross-browser and platform build expansion where hosted runners can provide meaningful evidence.
- Checksums/manifests for published artifacts.
- Real screenshots captured from verified builds rather than mock release evidence.

## Native release evidence

Source/configuration support is not equivalent to a verified native release. Before claiming a platform as 1.5.0 release-verified, record:

- Windows package build and smoke test;
- macOS package build, smoke test, and notarization boundary;
- Linux package build and smoke test;
- Android APK/AAB build plus emulator/real-device smoke test;
- iOS/iPadOS simulator/device build on macOS/Xcode;
- package filenames and checksums;
- relevant OS/device versions;
- signing/provisioning status without committing credentials.

## Version policy

All explicit project versions must equal the root workspace version. `scripts/check-versions.mjs` enforces this across:

- root `package.json`;
- Web `package.json`;
- desktop `package.json`;
- Tauri configuration;
- canonical Rust core crate;
- WASM bridge crate;
- native Tauri crate.

A version bump that leaves either dependency lockfile stale is incomplete.

## Merge policy

The 1.5.0 preparation branch must not bypass the active CI/security hardening work. Experimental branches are sources for reviewed ideas and proven patches, not mergeable release foundations. Port changes in small commits, run the hardened gates, and keep release notes limited to behavior verified on the final candidate.
