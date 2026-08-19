# Contributing to ThermoShift

Thank you for improving ThermoShift.

## Before opening code

1. Search existing issues and pull requests.
2. For larger changes, open a feature issue first so architecture and UX can be discussed.
3. Never include secrets, private user information, production credentials, or copied proprietary assets.

## Local quality gate

Install dependencies as described in `docs/setup.md`, then run:

```bash
cargo fmt --all -- --check
cargo test -p thermoshift-core
cargo clippy -p thermoshift-core -p thermoshift-wasm --all-targets -- -D warnings
npm --workspace @thermoshift/web run typecheck
npm --workspace @thermoshift/web run lint
npm --workspace @thermoshift/web run test
npm --workspace @thermoshift/web run build
```

Run Playwright for user-flow or accessibility changes.

## Commit style

Prefer small Conventional Commits such as `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `perf:`, `build:`, `ci:`, and `chore:`. Commits should be independently understandable and should not be artificially split just to increase count.

Project commits are intended to use `sanskarin@outlook.in` where the committing client supports author configuration. Configure local Git with:

```bash
git config user.email sanskarin@outlook.in
```

## Pull requests

Explain the problem and solution, list verification performed, add screenshots for UI changes, and update documentation when behavior or setup changes. New converter bugs should receive regression coverage in the Rust core whenever possible.
