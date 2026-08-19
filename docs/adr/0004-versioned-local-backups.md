# ADR 0004 — Versioned local backups

- **Status:** Accepted
- **Date:** 2026-08-19

## Context

ThermoShift is local-first and has no account or synchronization backend. Users still need a way to move or preserve settings and explicitly saved conversion history.

Browser-managed local storage and user-selected backup files have different trust/recovery goals:

- local storage should be recoverable when individual cached fields are malformed so the converter can still start with safe defaults;
- an explicitly imported backup is an untrusted external file and must not be silently repaired into different data before replacing application state.

Treating imported JSON as trusted state would make restore unsafe and future schema evolution ambiguous. Silently defaulting malformed backup fields or dropping duplicate records would also make a file appear successfully restored even when imported data had been changed.

## Decision

ThermoShift uses an explicit versioned JSON backup envelope for full-data export/restore.

Version 1 contains:

- `schemaVersion: 1`;
- a valid `exportedAt` timestamp;
- a complete valid settings object;
- zero to 50 valid history records with unique IDs.

Backup input is bounded to **256 KiB**. The Settings UI rejects oversized files before calling `File.text()`, and the parser independently verifies encoded byte length before JSON parsing.

Restore validates the complete envelope before replacing application state. Version 1 rejects:

- malformed JSON;
- unsupported or missing schema versions;
- missing/invalid export timestamps;
- missing/incomplete/out-of-range settings fields;
- missing or over-limit history arrays;
- invalid history IDs/timestamps/non-finite values/unsupported units;
- duplicate history identifiers.

Restore is all-or-nothing and does not partially import or silently normalize malformed external data.

After a file passes the strict validator, the accepted settings/history are returned in the application’s canonical in-memory shape.

Backup files are generated and read locally after explicit user action. No ThermoShift server receives the data.

## Consequences

### Positive

- Backup compatibility has a clear, independently testable contract.
- Untrusted files cannot silently inject malformed local state.
- Corrupt external files cannot appear successful after data-changing fallback normalization.
- Duplicate identifiers cannot cause silent history loss.
- Resource use from imported files is bounded before expensive parsing/state replacement.
- Future migrations can be explicit and testable.
- Local-first privacy is preserved.

### Trade-offs

- A backup with one malformed field is rejected rather than partially recovered.
- A backup from a future incompatible schema is rejected until a migration is implemented.
- The backup is plain JSON, so users must protect exported files themselves if saved history is sensitive to them.
- The parser intentionally behaves more strictly than browser local-storage recovery; maintainers must preserve that distinction.

## Follow-up rules

- Never silently reinterpret a different `schemaVersion` as the current format.
- Never silently default malformed imported settings or drop malformed/duplicate imported history records.
- Add migration/compatibility tests before accepting another schema version.
- Keep the backup parser independent from UI components.
- Keep size limits enforced at both UI file-selection and parser boundaries.
- Update `PRIVACY.md`, architecture/testing documentation, release notes, and `what_changed.md` when the backup contract changes.
