# Testing Strategy

ThermoShift uses layered tests so formula correctness, state safety, UI behavior, accessibility, and packaged user journeys fail independently and produce useful diagnostics.

## Rust unit/domain tests

`cargo test -p thermoshift-core` verifies:

- canonical reference points;
- all-scale round trips;
- absolute-zero boundaries;
- non-finite rejection;
- a dense 0–5000 K grid across every source/destination scale pair;
- expected scale direction, including the intentionally reversed Delisle scale.

Domain regressions belong here first. TypeScript UI tests must not become a second executable source of truth for conversion formulas.

## Web utility tests

Vitest covers:

- precision and rounding behavior;
- local-settings sanitization;
- invalid/malformed history rejection;
- history retention limits;
- storage-write failure resilience;
- onboarding persistence;
- versioned backup round trips;
- unsupported/corrupt backup rejection;
- CSV/history JSON serialization;
- browser download URL lifecycle.

## Web component tests

Testing Library exercises:

- instant conversion and invalid-input semantics;
- batch rows and line-level errors;
- reference-scale switching;
- history search/filter/delete/undo;
- settings precision bounds and destructive reset confirmation;
- validated backup restore and invalid restore errors;
- first-run onboarding choices;
- Quick Actions filtering/navigation;
- dialog initial focus, Escape behavior, and Tab wrapping;
- formula derivation and About identity surfaces;
- top-level keyboard navigation (`Alt+1` through `Alt+6`, `Ctrl/⌘+K`).

The application engine is mocked only at the presentation boundary in UI tests; formula correctness remains owned by Rust tests.

## End-to-end and accessibility

Playwright builds the real PWA and verifies:

- first-run onboarding;
- a real WebAssembly-backed 100 °C → 212 °F conversion;
- keyboard Quick Actions navigation;
- primary-screen axe scan;
- onboarding axe scan.

The Playwright configuration defines a desktop Chromium project and a Pixel 7 mobile emulation project. A future stable-release matrix may add other browser engines once toolchain verification is consistently green.

## Coverage gates

The web test command uses V8 coverage and currently requires at least:

- 75% lines;
- 70% functions;
- 65% branches;
- 75% statements.

Do not reduce thresholds merely to make CI green. Add behavior-focused tests, remove dead code, or document a justified exclusion when generated/platform-only code cannot be meaningfully exercised.

## CI expectations

Pull requests should fail when formatting, Clippy, TypeScript checking, ESLint, tests, coverage thresholds, PWA build, or E2E checks fail. Security analysis runs separately through CodeQL and dependency-audit workflows.

When fixing a CI failure, add or retain a regression test when the failure represents a real code defect rather than a tooling-only mismatch.

## Manual release checks

Before stable releases manually verify:

1. clean installation from a fresh checkout;
2. keyboard-only navigation;
3. screen-reader labels and dialog behavior;
4. 200% zoom and contrast modes;
5. offline launch and installability;
6. copy/share fallbacks;
7. history search/delete/undo;
8. full backup export and restore, including invalid-file rejection;
9. each target desktop package;
10. real screenshots captured from verified builds.

Automated green checks are necessary but not sufficient evidence for a stable release.
