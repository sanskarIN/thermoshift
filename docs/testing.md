# Testing Strategy

ThermoShift uses layered tests.

## Rust unit/domain tests

`cargo test -p thermoshift-core` verifies canonical reference points, all-scale round trips, absolute zero, and non-finite rejection. Domain regressions belong here first.

## Web unit/component tests

Vitest checks formatting, persistence hardening, and React startup behavior. The application engine is mocked only in presentation tests; formula correctness remains owned by Rust tests.

## End-to-end and accessibility

Playwright verifies a real conversion in the built PWA. axe scans the primary flow for automatically detectable accessibility violations.

## CI expectations

Pull requests should fail when formatting, Clippy, TypeScript checking, ESLint, tests, coverage thresholds, PWA build, or E2E checks fail. Security analysis runs separately through CodeQL and dependency-audit workflows.

## Manual release checks

Keyboard-only navigation, screen-reader labels, contrast, offline launch, installability, copy/share fallbacks, local history, exports, and each target desktop package must be manually smoke-tested before stable releases.
