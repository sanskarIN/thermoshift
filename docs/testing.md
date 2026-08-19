# Testing Strategy

ThermoShift uses layered verification so formula correctness, state safety, UI behavior, accessibility, documentation integrity, production size, and platform packaging fail independently and produce useful diagnostics.

## Rust unit/domain tests

`cargo test -p thermoshift-core` verifies:

- canonical reference points;
- all-scale round trips;
- absolute-zero boundaries;
- below-absolute-zero and non-finite rejection;
- a dense 0–5000 K grid across every source/destination scale pair;
- expected scale direction, including the intentionally reversed Delisle scale.

Domain regressions belong here first. TypeScript UI tests must not become a second executable source of truth for conversion formulas.

## Web utility/infrastructure tests

Vitest covers behavior including:

- precision and rounding;
- local-settings/history sanitization;
- duplicate history identifiers and retention limits;
- storage read/write failure resilience;
- onboarding persistence;
- versioned backup round trips;
- malformed, unsupported, and oversized backup rejection;
- CSV/history JSON serialization and browser download lifecycle;
- PWA update-service states;
- structured diagnostic redaction and bounded metadata.

## Web component/application tests

Testing Library exercises:

- instant conversion and invalid-input semantics;
- copy/share/save outcomes;
- batch rows and line-level errors;
- reference-scale switching;
- history search/filter/delete/clear/undo;
- Settings precision bounds and destructive reset confirmation;
- validated backup restore and invalid/oversized restore errors;
- first-run onboarding choices;
- Quick Actions filtering/navigation;
- dialog initial focus, Escape behavior, Tab/Shift+Tab wrapping, and focus restoration;
- formula derivation and About/support identity surfaces;
- application update controls;
- top-level keyboard navigation (`Alt+1` through `Alt+6`, `Ctrl/⌘+K`).

The application engine is mocked only at the presentation boundary in UI tests; formula correctness remains owned by Rust tests.

## End-to-end and accessibility

`npm --workspace @thermoshift/web run e2e` uses Playwright against the production/WASM-backed app. Current journeys cover:

- first-run onboarding;
- a real 100 °C → 212 °F conversion;
- keyboard Quick Actions navigation;
- saved-history persistence across reload;
- service-worker-controlled offline reload followed by a working conversion;
- Settings installed-version/update controls;
- axe scans for the primary converter, onboarding, and Settings surfaces.

The Playwright configuration defines desktop Chromium and Pixel 7 mobile-emulation projects, so these journeys execute at both configured form factors.

A successful emulation run is not a substitute for all real-device/browser evidence. Stable release evidence may add further engines/devices as defined by `release-evidence.md`.

## Screenshot evidence tests

Product screenshots use a separate Playwright configuration so release captures are intentional rather than test-failure artifacts:

```bash
npm --workspace @thermoshift/web run screenshots
npm run check:screenshots
```

The capture suite builds the real application and captures onboarding, converter, Settings, and About at desktop/mobile sizes.

`check:screenshots` then enforces:

- exactly eight expected PNG files;
- valid PNG signatures;
- nontrivial file size;
- sane desktop/mobile dimensions.

The hosted `Verified Product Screenshots` workflow follows the same path and may commit verified captures. Do not call screenshots complete merely because the workflow file exists; the PNG files themselves must exist and pass validation.

## Static repository checks

The dependency-free repository checks are part of the quality gate:

```bash
npm run check:versions
npm run check:desktop-config
npm run check:docs
```

They verify version alignment, Tauri frontend configuration, and relative Markdown link targets.

## Production asset budget

After a production build:

```bash
npm run check:web-budget
```

The checker measures runtime assets and enforces documented raw/gzip totals plus per-JavaScript/per-WASM limits. See `performance.md`.

## Coverage gates

The web test command uses V8 coverage and currently requires at least:

- 75% lines;
- 70% functions;
- 65% branches;
- 75% statements.

Do not reduce thresholds merely to make CI green. Add behavior-focused tests, remove dead code, or document a justified exclusion when generated/platform-only code cannot be meaningfully exercised.

## Security verification

Source-controlled security automation includes:

- CodeQL JavaScript/TypeScript analysis;
- Gitleaks repository secret scanning;
- RustSec audit;
- npm audit at high severity or greater;
- Dependabot dependency maintenance.

A security workflow definition is not evidence that the current candidate passed. Review the current workflow result before marking the release-evidence row successful.

## Desktop/platform verification

Repository-side checks include `npm run check:desktop-config` and `cargo check -p thermoshift-desktop` when the platform toolchain is installed.

The manual `Desktop Platform Verification` workflow defines unsigned native package jobs on Linux, Windows, and macOS and uploads each native bundle directory as workflow evidence. Each operating-system job must succeed independently; one platform cannot stand in for another.

## CI expectations

Pull requests should fail when applicable formatting, configuration, documentation-link, Clippy, TypeScript, ESLint, unit/component coverage, production build, asset-budget, E2E, or accessibility checks fail. Security analysis runs through CodeQL and the dependency/security workflow.

When fixing a surfaced defect, add or retain a regression test when the failure represents real application behavior rather than only a transient infrastructure problem.

## Manual release checks

Before a stable release, manually or platform-specifically verify what automation cannot fully establish:

1. clean installation from an exact candidate checkout;
2. keyboard-only navigation and visible focus;
3. screen-reader labels/dialog behavior;
4. 200% zoom, high contrast, and reduced motion;
5. real browser/device PWA installation and offline/update behavior as required by the release plan;
6. copy/share fallbacks;
7. history management and local persistence;
8. full backup export/restore including invalid/oversized rejection;
9. native Windows/macOS/Linux package outputs;
10. platform branding/icons;
11. real screenshots captured from verified builds;
12. release archive checksum validation.

Automated green checks are necessary but not sufficient evidence for a stable release. Record exact-candidate results in [`release-evidence.md`](release-evidence.md).
