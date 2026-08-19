# Architecture

ThermoShift is a modular monorepo with a deliberately small domain core and local-first presentation architecture.

## Layers

1. `crates/thermoshift-core`: dependency-free Rust domain logic. It owns supported units, Unicode-aware unit parsing, conversion formulas, absolute-zero validation, and domain error semantics.
2. `crates/thermoshift-wasm`: thin `wasm-bindgen` adapter. It translates JavaScript-friendly strings into Rust units and exposes domain calls to the browser.
3. `apps/web`: React/TypeScript presentation, local persistence, backup/export/share adapters, PWA service-worker/update state, redacted local diagnostics, accessibility behavior, localization data, and educational content.
4. `apps/desktop/src-tauri`: native packaging and a small command adapter that links the same Rust core.

Conversion formulas must not be reimplemented in TypeScript or platform-specific UI code. UI metadata such as labels, descriptions, reference-point explanations, and educational equations may be represented in TypeScript because they are presentation content rather than executable conversion logic.

## Web module boundaries

Important presentation/infrastructure modules include:

- `src/lib/engine.ts`: lazy WebAssembly engine adapter.
- `src/lib/storage.ts`: versioned local-storage parsing, forgiving local recovery, strict shape helpers, limits, and write resilience.
- `src/lib/backup.ts`: versioned full-data backup serialization, strict untrusted-file restore validation, and stable validation codes.
- `src/lib/export.ts`: user-triggered history/batch file exports.
- `src/lib/pwaUpdate.ts`: locale-neutral service-worker registration/update state.
- `src/lib/logger.ts`: local structured diagnostics with redaction and bounded metadata.
- `src/i18n/en.ts`: English product copy, validation guidance, and educational presentation strings.
- `src/hooks/useDialogFocusTrap.ts`: reusable modal keyboard-focus behavior.
- `src/components/*`: feature surfaces that receive domain/persistence dependencies through explicit props where useful.

This keeps domain rules, persistence recovery, strict file validation, update state, diagnostic sanitation, file serialization, browser interaction handling, accessibility mechanics, and copy independently testable.

## State

No server state is required.

Browser-managed state uses these versioned keys:

- `thermoshift.settings.v1`
- `thermoshift.history.v1`
- `thermoshift.onboarding.v1`

Settings/history are sanitized when loaded from browser storage because malformed local cache data should not prevent startup. History has a fixed maximum of 50 records and duplicate IDs are discarded during local recovery. Failed browser-storage reads/writes/removals do not crash the running converter; the current in-memory state remains usable and failures pass through the redacted local logger.

The service worker caches build artifacts. Desktop webview state follows the same frontend model.

## Backup boundary

Full backups use a separate versioned JSON envelope with:

- `schemaVersion`;
- `exportedAt`;
- complete `settings`;
- validated `history`.

Backup input is bounded to 256 KiB before UI file reading and again at the parser boundary.

Restore is intentionally stricter than local-storage recovery. Before application state changes, the parser rejects:

- malformed JSON;
- unsupported schema versions;
- missing/invalid export timestamps;
- incomplete or invalid settings fields;
- missing/invalid history arrays;
- more than 50 history entries;
- invalid history records/non-finite values/unsupported units/timestamps;
- duplicate conversion identifiers.

Known parser failures are represented as `BackupValidationError` values with stable machine-readable codes. The parser does not own English product copy and does not preserve reflected untrusted schema-version text in the error. Settings maps the code to locale-owned guidance, using the same source constants for the 256 KiB and 50-entry limits.

Unexpected browser file-read/runtime errors are not relabeled as validation errors. They pass through the redacted local diagnostic boundary and produce only generic localized restore-failure UI text.

A valid backup may be normalized into the canonical settings/history output shape only after the complete imported structure passes validation. This prevents partial restoration or silent data loss from malformed files.

Future backup schema changes must introduce an explicit compatibility/migration path rather than weakening the current schema validator.

## Internationalization boundary

English ships first. User-facing static product copy, including safe backup validation guidance, is centralized in `apps/web/src/i18n/en.ts` instead of being scattered through feature components or infrastructure parsers. New locales should match the same typed structure and must not alter executable conversion formulas, validation codes, or stable persistence identifiers.

Temperature scale names/symbols currently live with unit presentation metadata. If additional locales require translated scale descriptions, move that presentation metadata behind the locale layer while preserving stable `UnitId` values.

## Accessibility and interaction boundary

Dialog focus management is implemented once in `useDialogFocusTrap` and reused by onboarding and Quick Actions. Screen-specific components remain responsible for semantic labels, alert/status roles, and feature-specific accessible names.

Keyboard shortcuts are additive navigation affordances; every destination remains reachable through normal controls.

Global shortcut ownership follows these rules:

- `Ctrl/⌘+K` may open Quick Actions after onboarding and remains available from editable controls;
- `Alt+1…6` does not navigate while an input/textarea/select/contenteditable control owns editing focus;
- onboarding blocks background global shortcuts;
- Quick Actions blocks background page-navigation shortcuts while its modal is open.

Client-side page navigation updates the document title and a polite live region. Shortcut-capable navigation controls expose `aria-keyshortcuts`, while decorative visible `<kbd>` hints are hidden from the accessibility tree to avoid duplicate spoken shortcut text.

Clipboard and native sharing are user-triggered capability boundaries. Copy writes only the formatted result requested by the user. Native sharing receives the requested conversion text; when unavailable, the UI may fall back to copying that share text. A native `AbortError` means the user cancelled the share and therefore produces no failure status or warning log.

This keeps modal/focus ownership deterministic and prevents background UI changes during an active dialog while keeping browser-capability failures separate from domain validation.

## Failure and diagnostic boundaries

Invalid temperatures fail in the Rust domain before a result is emitted. Rust/WASM conversion errors may be shown when they directly describe user input validation.

Operational failures such as engine initialization, storage access, service-worker updates, unexpected backup file reads, or rejected clipboard/share promises follow a different path:

- detailed failure objects go only to the local structured logger;
- the logger redacts sensitive/identity/content/value-shaped metadata and reduces Error objects to safe type information;
- startup/update/backup/clipboard/share operational UI uses localized generic recovery/status text rather than echoing raw operational error messages;
- user-cancelled native sharing is not classified as an operational failure and is not logged as a warning.

Known backup content validation is separate from operational failure handling: stable parser codes map to safe locale-owned guidance, while arbitrary imported values are not reflected into that guidance.

Persistence parsing treats malformed browser-managed local data as recoverable and falls back to safe defaults. Backup restoration fails closed because selected files are an explicit untrusted input boundary.

## PWA/update boundary

Core conversion never waits for an update/network request. `pwaUpdate.ts` tracks service-worker readiness, offline/update-check state, and errors independently of the conversion engine. The UI may explicitly request `ServiceWorkerRegistration.update()` when online; lack of registration/connectivity does not disable conversion.

## Security boundary

The conversion engine is pure computation. The web app does not request network data for core conversion. Tauri uses a minimal capability set and restrictive CSP. File import is limited to user-selected JSON handled as bounded text and schema-validated before use. Interactive batch work is also bounded before per-line conversion. Clipboard/share integration occurs only after explicit user action, and operational browser failures pass through redacted diagnostics. External support/funding links are explicit user actions.

Source-controlled repository checks cover manifest/Tauri configuration, internal documentation links, production bundle budgets, CodeQL, Gitleaks, dependency audits, browser-engine compatibility, and release gates. Native signing/notarization credentials remain outside source control.

## Build/release evidence boundary

Generated files and platform evidence are not inferred from workflow definitions. Lockfiles, desktop icons, screenshots, browser results, and native bundles are considered present/verified only when the exact candidate contains the generated files or the relevant workflow artifact/result exists.

The release process/evidence contract lives in `docs/release.md` and `docs/release-evidence.md`.

## Architecture decisions

See `docs/adr/` for decisions that should remain stable across refactors. Changes that alter canonical conversion ownership, persistence schema, backup compatibility, localization structure, diagnostic privacy, or desktop/web delivery should receive an ADR update or replacement.
