# Architecture

ThermoShift is a modular monorepo with a deliberately small domain core and local-first presentation architecture.

## Layers

1. `crates/thermoshift-core`: dependency-free Rust domain logic. It owns supported units, conversion formulas, absolute-zero validation, and error semantics.
2. `crates/thermoshift-wasm`: thin `wasm-bindgen` adapter. It translates JavaScript-friendly strings into Rust units and exposes domain calls to the browser.
3. `apps/web`: React/TypeScript presentation, local persistence, backup/export/share adapters, PWA service worker configuration, accessibility behavior, localization data, and educational content.
4. `apps/desktop/src-tauri`: native packaging and a small command adapter that links the same Rust core.

Conversion formulas must not be reimplemented in TypeScript or platform-specific UI code. UI metadata such as labels, descriptions, reference-point explanations, and educational equations may be represented in TypeScript because they are presentation content rather than executable conversion logic.

## Web module boundaries

Important presentation modules include:

- `src/lib/engine.ts`: lazy WebAssembly engine adapter.
- `src/lib/storage.ts`: versioned local-storage parsing, sanitization, limits, and write resilience.
- `src/lib/backup.ts`: versioned full-data backup serialization and strict restore validation.
- `src/lib/export.ts`: user-triggered history/batch file exports.
- `src/i18n/en.ts`: English product copy and educational presentation strings.
- `src/hooks/useDialogFocusTrap.ts`: reusable modal keyboard-focus behavior.
- `src/components/*`: feature surfaces that receive domain/persistence dependencies through explicit props where useful.

This keeps domain rules, persistence validation, file serialization, accessibility mechanics, and copy separate enough to test independently.

## State

No server state is required.

Browser-managed state uses these versioned keys:

- `thermoshift.settings.v1`
- `thermoshift.history.v1`
- `thermoshift.onboarding.v1`

Settings and history are sanitized when loaded. History has a fixed maximum of 50 records. Failed browser-storage writes do not crash the running converter; the current in-memory state remains usable.

The service worker caches build artifacts. Desktop webview state follows the same frontend model.

## Backup boundary

Full backups use a separate versioned JSON envelope with:

- `schemaVersion`
- `exportedAt`
- sanitized `settings`
- validated `history`

Restore is all-or-nothing at the parsing boundary. Unsupported schema versions, malformed JSON, missing required shapes, over-limit history, or invalid conversion records are rejected before application state is replaced. This prevents a partially trusted backup from silently mixing with current state.

Future backup schema changes should introduce an explicit migration path instead of loosening validation for incompatible files.

## Internationalization boundary

English ships first. User-facing product copy is centralized in `apps/web/src/i18n/en.ts` instead of being scattered through feature components. New locales should match the same typed structure and should not alter executable conversion formulas in the Rust engine.

Temperature scale names/symbols currently live with unit presentation metadata. If additional locales require translated scale descriptions, move that presentation metadata behind the locale layer while preserving stable `UnitId` values.

## Accessibility boundary

Dialog focus management is implemented once in `useDialogFocusTrap` and reused by onboarding and Quick Actions. Screen-specific components remain responsible for semantic labels, alert/status roles, and feature-specific accessible names.

Keyboard shortcuts are additive navigation affordances; every destination remains reachable through normal controls.

## Failure boundaries

Invalid temperatures fail in the Rust domain before a result is emitted. The WASM and Tauri adapters convert domain errors into user-safe strings. Persistence parsing treats malformed local data as recoverable and falls back to safe defaults. Backup restoration is stricter because user-selected files are an explicit untrusted input boundary.

## Security boundary

The conversion engine is pure computation. The web app does not request network data for core functionality. Tauri uses a minimal capability set and a restrictive CSP. File import is limited to user-selected JSON handled as text and schema-validated before use. External support/funding links are explicit user actions.

## Architecture decisions

See `docs/adr/` for decisions that should remain stable across refactors. Changes that alter canonical conversion ownership, persistence schema, backup compatibility, localization structure, or desktop/web delivery should receive an ADR update or replacement.
