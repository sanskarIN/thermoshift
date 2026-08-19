# Changelog

All notable changes to ThermoShift are documented here. The project follows semantic versioning once releases are tagged.

## [Unreleased]

### Added

- Accessible first-run onboarding for local-first privacy, offline behavior, and settings discovery.
- Quick Actions command palette with `Ctrl/⌘+K` plus searchable page actions.
- Versioned full-data JSON backup and strict validated restore for settings and saved history.
- A 256 KiB backup input ceiling enforced before file reading and again at the parser boundary.
- History search, source/destination filters, individual delete, clear, undo, and duplicate-ID sanitization.
- User-selectable scale for temperature reference cards.
- Formula derivation notes for all educational scale relationships shown in the UI.
- Reusable dialog focus trap with initial focus, Tab wrapping, Escape handling where applicable, and focus restoration.
- Externalized English product-copy catalog to prepare the UI architecture for future locales.
- Application update section showing the installed version and exposing an explicit service-worker update check.
- Local structured JSON diagnostics with secret/PII-shaped metadata redaction and bounded values.
- Dense Rust conversion invariant tests across every supported scale pair.
- Expanded component, backup, export, PWA update, logging, accessibility, first-run, keyboard, restore, and Settings E2E tests.
- Cross-manifest version consistency checker.
- Static Tauri frontend path/configuration checker.
- Production web asset budget checker with raw and gzip limits.
- Repository secret scanning alongside CodeQL and dependency vulnerability checks.
- Tagged-release version/tag consistency checks and SHA-256 web artifact checksum publication.
- ADRs for versioned local backups and externalized product copy.

### Changed

- Local persistence sanitization now validates timestamps, enforces retention limits, deduplicates history identifiers, handles browser-storage write failures gracefully, and stores onboarding state separately.
- Converter validation exposes `aria-invalid`, resets stale action notices after input changes, and reports clearer share/copy outcomes.
- Settings now contains conversion, appearance/accessibility, application-update, privacy/data, and About/support sections.
- Project/support links are implemented once and reused by Settings and About.
- PWA update lifecycle state is locale-neutral; UI feedback is sourced from the English locale catalog.
- All npm, Rust, desktop, and Tauri product version metadata is aligned at `0.2.0`.
- Fixed Tauri pre-development/pre-build web workspace paths so they resolve to `apps/web` from `src-tauri`.
- Pull-request CI/security workflows cancel superseded runs created from the new concurrency-aware definitions.
- Release workflow now runs core/web quality gates and the production web asset budget before creating an artifact.
- Privacy, architecture, accessibility, testing, performance, README, release, and roadmap documentation are aligned with implemented behavior.
- Removed an unused persistence hook to keep the frontend surface smaller and coverage meaningful.

### Security and privacy

- Backup restore is treated as an untrusted-input boundary: oversized input, malformed JSON, unsupported schema versions, invalid records, and over-limit histories are rejected before application state changes.
- Full backup/export files remain local and user-controlled; ThermoShift does not upload them.
- Operational diagnostics stay local to the browser console and redact credential/session, identity/contact, content, input/output, and value-shaped metadata before serialization.
- Error objects are reduced to their type for structured logged metadata rather than logging raw error messages.
- Security automation includes CodeQL, repository secret scanning, RustSec audit, and npm audit.

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
