# ThermoShift Handoff — what_changed.md

## Current milestone

**Version:** 0.2 reliability/usability development branch  
**Branch:** `build/thermoshift-v0.2`  
**Base:** `main` at `648662788597dcfbbc0db7eb9021f1863c764fb5`  
**Phase:** Product implementation and documentation for the v0.2 reliability layer are complete; live CI and clean-toolchain verification are the current gate before merge/release claims.

## Repository history already completed

- The original repository MIT license and history were preserved.
- ThermoShift 0.1 foundation was implemented in 24 meaningful feature-branch commits and merged through pull request #1.
- Pull request #1 merge commit: `21638734e7d326b605975eef27c24b74e409f4a8`.
- The previous `main` handoff checkpoint is `648662788597dcfbbc0db7eb9021f1863c764fb5`.

## v0.2 completed work

### Local persistence and backup

- Hardened settings/history parsing and browser-storage write failure handling.
- Added separate versioned onboarding state: `thermoshift.onboarding.v1`.
- Retained versioned settings/history keys: `thermoshift.settings.v1` and `thermoshift.history.v1`.
- Added strict history timestamp validation and the existing 50-record retention limit at the sanitization boundary.
- Added a versioned full-data backup format in `apps/web/src/lib/backup.ts`.
- Backup version 1 contains schema version, export timestamp, sanitized settings, and validated saved history.
- Restore rejects malformed JSON, unsupported schema versions, malformed/missing structures, invalid history records, and over-limit histories before application state changes.
- Added Settings UI for full backup export and explicit local JSON restore.
- Added reset confirmation and local onboarding reset behavior.
- Updated privacy and architecture documentation for the backup trust boundary.

### Onboarding and navigation

- Added first-run onboarding describing eight scales, offline operation, and local-first data behavior.
- Added a settings-first onboarding path without forcing registration or network use.
- Added Quick Actions with `Ctrl/⌘+K`, search, and direct page navigation.
- Retained `Alt+1` through `Alt+6` shortcuts and normal keyboard navigation.
- Added a reusable focus-trap hook for modal dialogs.
- Onboarding and Quick Actions move focus inside, contain Tab/Shift+Tab, and restore previous focus when unmounted; Quick Actions also supports Escape.

### Converter and reference improvements

- Converter now clears stale copy/share notices after the value or unit changes.
- Invalid converter input now exposes `aria-invalid` and only references the error description while an error exists.
- Share behavior reports separate successful share and copy-fallback outcomes.
- Reference points can be switched to any supported temperature scale instead of being fixed to one display scale.

### History improvements

- Added search across values, scale names/symbols, and localized timestamps.
- Added source-scale and destination-scale filters.
- Added individual history deletion with descriptive accessible names.
- Added clear-all with in-app undo state.
- Added individual-delete undo state.
- History export remains separate from full settings/history backup.

### Education and internationalization architecture

- Added derivation notes to each educational formula card.
- Centralized English product copy in `apps/web/src/i18n/en.ts`.
- Externalized shell, onboarding, Quick Actions, converter, batch, history, reference, formulas, settings, About, status/error, and accessible-label copy.
- Stable persisted IDs, schema fields, and Rust domain identifiers remain non-localized.
- Added ADR 0005 describing the localization boundary.

### Test and reliability expansion

- Added backup round-trip and corruption/rejection tests.
- Added local-storage sanitization, onboarding, retention, and write-failure resilience tests.
- Added export helper tests for CSV, versioned history JSON, object URL creation, download click, and URL revocation.
- Added component tests for converter validation/save, batch line errors, reference scale switching, history filtering/delete/undo, settings precision/reset confirmation, Quick Actions, onboarding, formulas, and About.
- Added backup-restore component tests for valid and invalid files.
- Added dialog focus tests for initial focus, Escape, and Tab wrapping.
- Expanded application-level tests for first run, `Alt+5`, and `Ctrl+K` navigation.
- Expanded Playwright coverage for onboarding, real WASM conversion, keyboard Quick Actions, primary-screen axe scan, and onboarding axe scan.
- Added a dense Rust invariant grid covering 0–5000 K across every source/destination scale pair.
- Added scale-direction invariant coverage including reversed Delisle behavior.
- Removed unused `usePersistentState.ts` rather than carrying dead code or weakening coverage thresholds.
- Added deterministic test shims for animation frame and object URL browser APIs.

### Documentation and architecture records

Updated:

- `README.md`
- `PRIVACY.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `docs/architecture.md`
- `docs/accessibility.md`
- `docs/testing.md`

Added:

- `docs/adr/0004-versioned-local-backups.md`
- `docs/adr/0005-externalized-product-copy.md`

Documentation now describes the implemented onboarding, Quick Actions, history search/delete/undo, full backup/restore, dialog accessibility behavior, localization boundary, dense Rust invariants, and release-verification status.

## Files changed in v0.2 before this handoff commit

GitHub compare `main...build/thermoshift-v0.2` reported:

- **53 meaningful commits ahead**
- **0 commits behind**
- **36 changed files**

Major changed areas:

- `apps/web/src/App.tsx`
- `apps/web/src/components/`
- `apps/web/src/hooks/`
- `apps/web/src/i18n/`
- `apps/web/src/lib/`
- `apps/web/e2e/`
- `crates/thermoshift-core/src/temperature.rs`
- root product/privacy/release documentation
- `docs/architecture.md`
- `docs/accessibility.md`
- `docs/testing.md`
- `docs/adr/`

This handoff update itself adds another meaningful documentation commit after those compare statistics.

## Important v0.2 commit checkpoints

Representative atomic commits from this branch include:

- `7ddb1b6` — `refactor(storage): harden local persistence primitives`
- `d902333` — `feat(data): add versioned local backup format`
- `77f6e74` — `test(data): cover backup round trips and corruption`
- `fd01930` — `feat(references): let users compare points in any scale`
- `142f897` — `feat(history): add search filters delete and undo`
- `37b1694` — `feat(settings): add backup restore and safe reset controls`
- `3f7a4d3` — `feat(app): integrate onboarding backup history and quick actions`
- `7c33aa4` — `style: polish onboarding quick actions and data tools`
- `c4d8cfc` — `test(storage): cover sanitization and onboarding state`
- `28a96aa` — `test(web): add deterministic browser API shims`
- `1b1d1e3` — `feat(education): expand formula derivation notes`
- `27c45f4` — `fix(converter): reset stale notices and expose invalid state`
- `c91b4ba` — `feat(accessibility): add reusable dialog focus trap`
- `fef78af` — `fix(accessibility): preserve button semantics in quick actions`
- `663db54` — `test(ui): align quick action tests with button semantics`
- `d37f642` — `refactor(web): remove unused persistence hook`
- `8237b3b` — `test(export): cover csv json and download helpers`
- `7c5d156` — `test(accessibility): cover restore flow and dialog focus behavior`
- `9798e46` — `fix(core): format unit debug value in invariant test`
- `a71e69f` — `refactor(i18n): externalize application shell labels`
- `7a15d18` — `refactor(i18n): source application shell copy from locale data`
- `52819a5` — `docs(adr): define versioned local backup contract`
- `2a82e32` — `docs(adr): define externalized localization boundary`
- `73f68e2` — `docs: document v0.2 product workflows`
- `1cf8512` — `docs(privacy): document onboarding backup and restore data`
- `37c0e00` — `docs(accessibility): document dialog and keyboard behavior`
- `9068032` — `docs(architecture): describe v0.2 local data boundaries`
- `c0ebad9` — `docs(testing): record expanded regression coverage`
- `ea0301e` — `docs(changelog): record v0.2 reliability improvements`
- `ab54473` — `docs(roadmap): advance implemented reliability work`

GitHub's low-level Git commit API was checked for `ab54473370ff5b3f8d46d2fc278e4f5413157e06`; both author and committer are `Sanskar <sanskarin@outlook.in>`, confirming the requested commit email remains in use.

## Verification performed in this continuation

Repository-level checks:

- Confirmed `build/thermoshift-v0.2` started from the exact current `main` checkpoint.
- Compared branch against `main`: 53 commits ahead and 0 behind before this handoff commit.
- Inspected each modified implementation area while extending it rather than replacing the existing architecture.
- Maintained the canonical Rust engine as the only executable formula source.
- Kept the existing test coverage thresholds; no thresholds were reduced to hide untested code.
- Added tests around newly introduced behavior and removed genuinely unused code.
- Verified requested Git commit email through GitHub's Git commit object.

Live compile/test evidence is intentionally not claimed yet. The next step is the pull-request-triggered GitHub Actions run so the branch is exercised with Rust, Node, wasm-pack, TypeScript, ESLint, Vitest coverage, PWA build, Playwright, and security workflows using real hosted toolchains.

## Known limitations / release blockers

1. `package-lock.json` and `Cargo.lock` are still not committed because the prior sandbox could not complete external dependency resolution. Do not fabricate lockfiles. Generate, review, and commit them from a successful clean dependency resolution.
2. The v0.2 branch has not yet received live GitHub Actions evidence at the time of this handoff commit. Any CI/toolchain drift found by the PR must be fixed before a passing status is claimed.
3. Real screenshots must come from a verified running build; placeholders are not presented as screenshots.
4. Native Windows/macOS/Linux packaging and smoke tests require the actual platform prerequisites.
5. Signed installers/notarization require owner-controlled secrets that must never be committed.
6. Branch protection and GitHub Discussions are repository settings and must be configured through repository settings if the connector does not expose them.

## Next exact tasks

1. Open the v0.2 pull request against `main` without squashing the meaningful commit history.
2. Inspect every surfaced CI workflow/job and capture failures rather than assuming success.
3. Fix any Rust formatting/Clippy/test, TypeScript, ESLint, Vitest coverage, PWA build, or Playwright failure with an atomic regression commit.
4. Re-run failed jobs as needed until the available PR checks are green.
5. If dependency resolution succeeds in hosted CI but lockfiles remain absent, generate/review lockfiles in a writable full checkout before the release candidate.
6. Merge v0.2 only after mergeability and available CI evidence have been reviewed.
7. Update this file on `main` with the final PR number, compare statistics, merge commit, CI results, and any fixes discovered during verification.
8. Build Tauri packages on Windows, macOS, and Linux and capture real product screenshots.
9. Prepare a tagged release only after all Phase 6 release-candidate checks are evidenced.

## Migration notes

There is no database or remote migration.

Local storage currently uses:

- `thermoshift.settings.v1`
- `thermoshift.history.v1`
- `thermoshift.onboarding.v1`

Full backups use `schemaVersion: 1` independently from local-storage key versions. Future local-storage or backup format changes must add explicit compatibility/migration logic instead of silently interpreting incompatible data.

## Release notes draft

ThermoShift v0.2 builds on the Rust/WebAssembly local-first converter foundation with a first-run onboarding experience, keyboard Quick Actions, searchable/filterable history with delete and undo, strict versioned full-data backup/restore, selectable reference scales, expanded educational derivations, centralized English product copy, reusable dialog-focus accessibility behavior, and substantially broader Rust/UI/E2E regression coverage. Release status remains development/verification until hosted CI and clean-platform checks provide evidence.

## Continuation rule

Read this file first, then inspect the latest `main`/feature-branch commits and open CI/PR state before changing code. Do not repeat completed v0.2 work unless a failing check demonstrates a regression. GitHub history remains the source of truth for exact hashes and merge state.
