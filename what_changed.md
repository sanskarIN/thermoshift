# ThermoShift Handoff — what_changed.md

## Current milestone

**Version:** 0.1.0 development baseline  
**Phase:** Phases 0–4 implementation baseline complete and merged to `main`; Phases 5–6 are at clean-build/release-verification stage.

## Completed work

- Preserved the repository's existing MIT license and initial history.
- Added a Rust workspace and canonical dependency-free temperature conversion engine.
- Implemented Celsius, Fahrenheit, Kelvin, Rankine, Réaumur, Delisle, Newton, and Rømer conversions.
- Added absolute-zero and non-finite input validation.
- Added reference-point, all-scale round-trip, boundary, and invalid-input Rust tests.
- Added a `wasm-bindgen` bridge so the browser uses the Rust engine instead of duplicating executable conversion formulas.
- Added a React/TypeScript/Vite PWA with instant conversion, swap, validation feedback, precision/rounding controls, copy/share, local history, batch conversion, CSV/JSON export, educational formulas, comparison/reference cards, offline status, themes, high contrast, reduced motion, keyboard shortcuts, privacy/data reset, About, contacts, BMC, and the `Made by the Sanskar` credit.
- Added an editable SVG application logo and responsive design system.
- Added a Tauri 2 desktop target for Windows, macOS, and Linux with a minimal capability set and CSP.
- Added Vitest, Testing Library, Playwright, and axe test coverage foundations.
- Added GitHub Actions CI, CodeQL, Rust/npm dependency audits, Dependabot, release automation, issue templates, PR template, CODEOWNERS, release-note categories, and funding configuration.
- Added the complete documentation baseline requested by the master prompt: README, contributing, code of conduct, security, support, privacy, changelog, roadmap, architecture, setup, development, testing, release, troubleshooting, accessibility, performance, and ADRs.
- Merged implementation pull request #1 to `main` using a merge commit so the 24 meaningful feature-branch commits remain visible in history.

## Files/modules added or changed

Major areas:

- `/crates/thermoshift-core`
- `/crates/thermoshift-wasm`
- `/apps/web`
- `/apps/desktop/src-tauri`
- `/.github`
- `/docs`
- root build/configuration/community files

The pre-existing `LICENSE` was retained. Pull request #1 contained **87 changed files** and **2,633 additions**.

## Tests added

- Rust canonical reference-point tests.
- Cross-scale round-trip tests across all eight units.
- Absolute-zero boundary tests for all units.
- Non-finite input rejection tests.
- TypeScript rounding/formatting tests, including negative half-away-from-zero behavior.
- Local-storage resilience, malformed-unit, reset, and history-limit tests.
- React startup component test with the engine mocked only at the UI boundary.
- Playwright real conversion smoke test.
- Playwright + axe primary-screen accessibility test.

## Commands and checks run in this chat

Local execution sandbox:

- `rustc --version` / `cargo --version`: unavailable in the sandbox, so Rust compilation, rustfmt, and Clippy could not be executed locally.
- `node --version`: Node.js 22 is installed.
- JSON files were parsed successfully after generation.
- TypeScript/TSX files were passed through the globally installed TypeScript transpiler for syntax diagnostics: no syntax errors were reported.
- A full `tsc -b` was attempted and stopped only because project dependencies/type packages are not installed in the sandbox (`vite/client`, `vitest/globals`, and `node` type definitions unavailable locally).
- An npm registry lookup timed out, so dependency installation/lockfile generation was not fabricated.

Repository verification:

- Connector-created Git commits were inspected through GitHub's Git commit API. Commit `e35dbd7a6b23673d622557734a69e038475cd0aa` reports both author and committer email as `sanskarin@outlook.in`, confirming the requested commit email is used by the connected GitHub identity.
- Before merge, `build/thermoshift-v0.1` was verified as 24 commits ahead of `main`, 0 behind, with no merge conflict.
- Pull request #1 was merged successfully. Merge commit: `21638734e7d326b605975eef27c24b74e409f4a8`.
- GitHub workflow runs had not yet surfaced through the connector immediately after the merge checks in this session; no passing status is claimed without evidence.

## Known limitations / release blockers

1. Dependency lockfiles are not yet committed because the sandbox could not complete networked dependency resolution. CI deliberately uses `npm install` rather than `npm ci` until a reviewed `package-lock.json` exists. A clean developer checkout should generate and commit `package-lock.json` and `Cargo.lock` after successful verification.
2. Real screenshots, native installers, signing/notarization, and native smoke tests require real Windows/macOS/Linux toolchains and must not be fabricated.
3. Desktop release automation currently publishes the web artifact only. Signed native installers require repository-owner signing secrets and platform runners.
4. Branch protection and GitHub Discussions are repository settings; this connector session does not expose those mutations. Recommended settings are documented below under next tasks.

## Next exact tasks

1. Check the newest `main` GitHub Actions runs and fix any dependency/API drift revealed by the live toolchains.
2. On a full toolchain machine, run `npm install`; review and commit the generated `package-lock.json`.
3. Run Cargo dependency resolution; review and commit `Cargo.lock` for this application workspace.
4. Run `cargo test -p thermoshift-core`, `cargo fmt --all -- --check`, Clippy, web typecheck/lint/test/build, and Playwright from a clean checkout.
5. Build Tauri packages on Windows, macOS, and Linux, then capture actual screenshots for README/release assets.
6. Configure `main` branch protection to require CI/security checks and pull-request review as appropriate.
7. Enable GitHub Discussions if community Q&A is desired.
8. Prepare `v0.1.0` only after all Phase 6 checks pass.

## Migration notes

There is no database or remote migration. Local storage keys are versioned as `thermoshift.settings.v1` and `thermoshift.history.v1`. Future storage-schema changes must migrate or version old data explicitly rather than silently assuming a new shape.

## Release notes draft

ThermoShift 0.1 introduces a local-first multi-scale temperature converter with a canonical Rust engine, WebAssembly-powered React PWA, Tauri desktop target, batch/history/export tools, formula/reference education, offline support, accessibility preferences, and professional CI/security/documentation foundations.

## Meaningful commit checkpoint

Implementation history created in this work session:

- `9c76bc2` — `build: bootstrap Rust workspace`
- `96fb4c8` — `build: add workspace developer commands`
- `055a5cf` — `chore: add repository hygiene configuration`
- `807928e` — `feat(core): add validated multi-scale conversion engine`
- `90663b2` — `feat(wasm): expose Rust engine to the PWA`
- `5d3ea8d` — `build(web): configure React TypeScript PWA toolchain`
- `f9a769f` — `feat(web): add typed engine and local data foundations`
- `937d971` — `feat(web): add accessible instant converter and reference cards`
- `d387afc` — `feat(web): add batch conversion and local history`
- `11616b5` — `feat(web): add formulas settings and project about`
- `d8eda33` — `feat(web): compose responsive accessible application shell`
- `df1450b` — `test(web): cover formatting persistence UI and accessibility`
- `aabcc5a` — `feat(desktop): add Tauri 2 application target`
- `e50c215` — `chore(github): add contribution and dependency templates`
- `cec26c1` — `ci: verify Rust web and end-to-end quality gates`
- `c6713e7` — `ci: add CodeQL and dependency security audits`
- `e10cc27` — `ci: add tagged web release workflow`
- `a51fda1` — `docs: add project overview and contribution guidance`
- `d9fd621` — `docs: define security privacy and support policies`
- `4760df6` — `docs: document architecture setup development and testing`
- `2535d5d` — `docs: add release accessibility troubleshooting and performance guides`
- `620416f` — `docs(adr): record core delivery and persistence decisions`
- `e35dbd7` — `docs: add changelog roadmap and release metadata`
- `ea8fbbc` — `docs: add implementation handoff checkpoint`
- `2163873` — merge commit for pull request #1

This file is the authoritative continuation checkpoint; GitHub history remains the source of truth for exact final hashes/messages.