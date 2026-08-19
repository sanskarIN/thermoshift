# ADR 0004 — Versioned local backups

- **Status:** Accepted
- **Date:** 2026-08-19

## Context

ThermoShift is local-first and has no account or synchronization backend. Users still need a way to move or preserve their settings and explicitly saved conversion history. Treating an imported JSON file as trusted application state would make backup restore an unsafe parsing boundary and would make future schema evolution ambiguous.

## Decision

ThermoShift uses an explicit versioned JSON backup envelope for full-data export/restore.

Version 1 contains:

- `schemaVersion: 1`;
- `exportedAt`;
- sanitized settings;
- validated history records.

Restore validates the complete envelope before replacing application state. Unsupported versions, malformed JSON, missing shapes, invalid history records, and history beyond the supported retention limit are rejected. Restore does not partially import a file.

Backup files are generated and read locally after an explicit user action. No ThermoShift server receives the data.

## Consequences

### Positive

- Backup compatibility has a clear contract.
- Untrusted files cannot silently inject malformed local state.
- Future migrations can be explicit and testable.
- Local-first privacy is preserved.

### Trade-offs

- A backup from a future incompatible schema is rejected until a migration is implemented.
- The backup is plain JSON, so users must protect exported files themselves if their saved history is sensitive to them.

## Follow-up rules

- Never silently reinterpret a different `schemaVersion` as the current format.
- Add migration tests before accepting another schema version.
- Keep the backup parser independent from UI components.
- Update `PRIVACY.md`, testing documentation, and release notes when the backup schema changes.
