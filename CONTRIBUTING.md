# Contributing to ThermoShift

Thank you for improving ThermoShift.

## Before opening code

1. Search existing issues and pull requests.
2. For larger changes, open a feature issue first so architecture and UX can be discussed.
3. Read `docs/architecture.md` and the relevant ADRs before changing domain, persistence, backup, localization, or platform boundaries.
4. Never include secrets, private user information, production credentials, signing/notarization material, or copied proprietary assets.

## Local quality gate

Install dependencies as described in `docs/setup.md`, then run the checks relevant to your change. The repository commits npm and Cargo lockfiles; normal verification should consume them rather than silently resolving a different graph.

Repository metadata/documentation:

```bash
npm run check:versions
npm run check:desktop-config
npm run check:docs
```

Rust/domain:

```bash
cargo fmt --all -- --check
cargo test --locked -p thermoshift-core
cargo clippy --locked -p thermoshift-core -p thermoshift-wasm --all-targets -- -D warnings
```

Web/PWA:

```bash
npm ci --ignore-scripts
npm --workspace @thermoshift/web run typecheck
npm --workspace @thermoshift/web run lint
npm --workspace @thermoshift/web run test
npm --workspace @thermoshift/web run build
npm run check:web-budget
```

For user-flow, persistence, offline, keyboard, or accessibility changes, also run:

```bash
npx playwright install chromium
npm --workspace @thermoshift/web run e2e
```

For browser-compatibility-sensitive web changes, install all supported Playwright engines and run the focused compatibility suite too:

```bash
npx playwright install chromium firefox webkit
npm --workspace @thermoshift/web run e2e:cross-browser
```

For UI changes that need release/review captures:

```bash
npm --workspace @thermoshift/web run screenshots
npm run check:screenshots
```

Do not weaken coverage, performance, accessibility, documentation, reproducibility, or security gates merely to make a pull request green.

## Domain and data rules

- Keep executable temperature formulas in `thermoshift-core`; do not reimplement them in React.
- Treat imported backup files as untrusted input.
- Keep local-storage and backup schemas versioned and document compatibility changes.
- Preserve bounded history/backup behavior and the documented batch-input resource ceilings unless a measured change justifies revising them.
- Add regression tests for fixed defects.
- Keep user-visible static product copy in the locale module where appropriate.

## Commit style

Prefer small Conventional Commits such as `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `perf:`, `build:`, `ci:`, and `chore:`. Commits should be independently understandable and should not be artificially split just to increase count.

Project commits are intended to use `sanskarin@outlook.in` where the committing client supports author configuration. Configure local Git with:

```bash
git config user.email sanskarin@outlook.in
```

## Pull requests

Use the pull request template. Explain the problem and solution, list verification actually performed, add real screenshots when UI evidence materially helps, and update documentation when behavior/setup/release requirements change.

Do not claim a generated lockfile, platform package, screenshot, signing result, browser/security result, or release gate exists merely because automation for it has been added. Evidence must correspond to the exact candidate commit. Committed generated inputs such as lockfiles/icons are inputs to verification, not substitutes for successful candidate checks.

For release-candidate work, follow `docs/release.md` and `docs/release-evidence.md`.
