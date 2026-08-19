# Changelog

All notable changes to ThermoShift are documented here. The project follows semantic versioning once releases are tagged.

## [Unreleased]

### Added

- Accessible first-run onboarding for local-first privacy, offline behavior, and settings discovery.
- Quick Actions command palette with `Ctrl/⌘+K` plus searchable page actions.
- Versioned full-data JSON backup and strict validated restore for settings and saved history.
- History search, source/destination filters, individual delete, clear, and undo flows.
- User-selectable scale for temperature reference cards.
- Formula derivation notes for all educational scale relationships shown in the UI.
- Reusable dialog focus trap with initial focus, Tab wrapping, Escape handling where applicable, and focus restoration.
- Externalized English product-copy catalog to prepare the UI architecture for future locales.
- Dense Rust conversion invariant tests across every supported scale pair.
- Expanded component, backup, export, accessibility, first-run, keyboard, and restore regression tests.
- ADRs for versioned local backups and externalized product copy.

### Changed

- Local persistence sanitization now validates timestamps, enforces retention limits, handles browser-storage write failures gracefully, and stores onboarding state separately.
- Converter validation now exposes `aria-invalid`, resets stale action notices after input changes, and reports clearer share/copy outcomes.
- Privacy, architecture, accessibility, testing, README, and roadmap documentation now reflect actual local backup, keyboard, history, and localization behavior.
- Removed an unused persistence hook to keep the frontend surface smaller and coverage meaningful.

### Security and privacy

- Backup restore is treated as an untrusted-input boundary: malformed JSON, unsupported schema versions, invalid records, and over-limit histories are rejected before application state changes.
- Full backup/export files remain local and user-controlled; ThermoShift does not upload them.

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
