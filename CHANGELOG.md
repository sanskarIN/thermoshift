# Changelog

All notable changes to ThermoShift are documented here. The project follows semantic versioning once releases are tagged.

## [Unreleased]

### Added

- Accessible first-run onboarding for local-first privacy, offline behavior, and settings discovery.
- Quick Actions command palette with `Ctrl/⌘+K` plus searchable page actions.
- Versioned full-data JSON backup and strict validated restore for settings and saved history.
- A 256 KiB backup input ceiling enforced before file reading and again at the parser boundary.
- A dedicated backup-validation error type separating safe user-facing validation guidance from unexpected operational failures.
- History search, source/destination filters, individual delete, clear, undo, and duplicate-ID sanitization.
- User-selectable scale for temperature reference cards.
- Formula derivation notes for all educational scale relationships shown in the UI.
- Reusable dialog focus trap with initial focus, Tab wrapping, Escape handling where applicable, and focus restoration.
- Externalized English product-copy catalog to prepare the UI architecture for future locales.
- Application update section showing the installed version and exposing an explicit service-worker update check.
- Local structured JSON diagnostics with secret/PII-shaped metadata redaction and bounded values.
- Dense Rust conversion invariant tests across every supported scale pair.
- Unit-parser regression coverage for names, symbols, aliases, whitespace, unknown values, and uppercase accented scale names.
- Expanded component, backup, export, PWA update, logging, accessibility, first-run, keyboard, restore, offline, persistence, and Settings E2E tests.
- Interactive batch-conversion resource bounds of 32,768 characters and 1,000 lines before per-line conversion work.
- Chromium/Firefox/WebKit compatibility smoke tests covering real WASM conversion, history persistence, and axe checks.
- A dedicated cross-browser GitHub Actions matrix with engine-specific failure reports and post-merge `main` verification.
- Cross-manifest version consistency checker.
- Static Tauri frontend path/configuration checker.
- Dependency-free internal Markdown link checker.
- Production web asset budget checker with raw and gzip limits.
- Dedicated real-product Playwright screenshot configuration and exact PNG evidence validator.
- Manual verified-screenshot workflow that can upload and commit successfully validated product captures.
- Manual unsigned Windows/macOS/Linux Tauri package verification matrix with uploaded native bundle evidence.
- Reproducible Tauri desktop icon-generation command/workflow using the editable SVG logo source.
- Generated-artifact evidence uploads for lockfile, desktop-icon, and screenshot workflows before branch commit attempts.
- Repository secret scanning alongside CodeQL and dependency vulnerability checks.
- Tagged-release version/tag consistency checks, documentation/configuration gates, browser E2E/axe verification, asset budgets, and SHA-256 web artifact checksum publication.
- Release-evidence template covering exact-candidate web, security, screenshot, offline, native-platform, branding, and artifact verification.
- Repository-settings guidance for branch protection, Discussions, labels, milestones, merge policy, and security features.
- ADRs for versioned local backups and externalized product copy.

### Changed

- Local persistence sanitization validates timestamps, enforces retention limits, deduplicates history identifiers, handles browser-storage write failures gracefully, and stores onboarding state separately.
- Backup restore now rejects malformed settings, invalid/missing export timestamps, duplicate conversion identifiers, oversized payloads, invalid records, unsupported schemas, and over-limit histories rather than silently normalizing imported corruption.
- Unexpected backup file-read/runtime failures no longer expose raw browser error messages in Settings; they are recorded only through the redacted local diagnostic boundary while the UI shows a generic restore failure.
- Converter validation exposes `aria-invalid`, resets stale action notices after input changes, and reports clearer share/copy outcomes.
- Rust unit parsing now uses Unicode-aware lowercase normalization so uppercase accented `RÉAUMUR`/`RØMER` input is accepted consistently.
- Settings contains conversion, appearance/accessibility, application-update, privacy/data, and About/support sections.
- Project/support links are implemented once and reused by Settings and About.
- PWA update lifecycle state is locale-neutral; UI feedback is sourced from the English locale catalog.
- Raw service-worker update errors no longer appear in user-facing Settings copy; failures remain available only through the redacted operational logging boundary.
- Raw engine-initialization errors no longer appear on the startup failure screen; the user receives localized recovery guidance while diagnostics remain redacted/local.
- Global page-navigation shortcuts no longer fire while focus is in an editable control or while onboarding/Quick Actions owns modal interaction.
- Client-side page navigation now synchronizes the document title, announces the active page through a polite live region, and exposes `aria-keyshortcuts` while keeping visible `<kbd>` hints out of accessible button names.
- Stable tagged releases now install and gate on Chromium, Firefox, and WebKit compatibility in addition to the fuller primary Chromium E2E/axe suite.
- All npm, Rust, desktop, and Tauri product version metadata is aligned at `0.2.0`.
- Fixed Tauri pre-development/pre-build web workspace paths so they resolve to `apps/web` from `src-tauri`.
- Pull-request CI/security workflows cancel superseded runs created from the concurrency-aware definitions.
- CI metadata now enforces version consistency, Tauri frontend configuration, and internal documentation-link integrity.
- Release workflow now runs the full web release gate rather than bypassing Rust format/Clippy, docs/config checks, E2E/axe, browser-engine compatibility, or the production asset budget.
- Makefile, setup, development, testing, release, performance, contribution, and pull-request guidance now match the v0.2 quality/evidence model.
- Removed an unused persistence hook to keep the frontend surface smaller and coverage meaningful.

### Security and privacy

- Backup restore is treated as an untrusted-input boundary and fails closed for malformed candidate data before application state changes.
- Known backup-validation failures are explicitly distinguished from unexpected operational failures so only trusted validation guidance reaches the user.
- Full backup/export files remain local and user-controlled; ThermoShift does not upload them.
- Operational diagnostics stay local to the browser console and redact credential/session, identity/contact, content, input/output, and value-shaped metadata before serialization.
- Error objects are reduced to their type for structured logged metadata rather than logging raw error messages.
- User-facing startup/update/backup operational error surfaces no longer echo raw operational error messages.
- Batch paste floods are bounded before conversion work to reduce accidental client-side resource exhaustion.
- Security automation includes CodeQL, Gitleaks repository secret scanning, RustSec audit, and npm audit.
- Desktop signing/notarization remains explicitly outside source control and requires owner-controlled credentials.

### Release evidence still pending

The following are not considered complete merely because supporting workflows exist:

- generated and committed `package-lock.json`/`Cargo.lock` for locked dependency builds;
- generated and committed Tauri platform icon assets;
- generated and committed verified product screenshots;
- current-head hosted CI/Cross-browser E2E/CodeQL/Gitleaks/dependency-security success;
- successful unsigned native package evidence for every intended desktop platform;
- owner-controlled signing/notarization and final stable tag/release evidence.

## 0.1 development baseline

### Added

- Canonical Rust conversion engine for eight temperature scales.
- Physical validation against absolute zero.
- WebAssembly bridge for browser use.
- React/TypeScript PWA with converter, batch mode, history, formulas, settings, About, export, copy, and share flows.
- Offline PWA configuration and responsive accessible design system.
- Tauri desktop shell for Windows, macOS, and Linux.
- Unit, UI, storage, E2E, and automated accessibility test foundations.
- CI, CodeQL, dependency auditing, Dependabot, release workflow, issue templates, and project documentation.