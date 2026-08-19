# ADR 0005 — Externalized product copy

- **Status:** Accepted
- **Date:** 2026-08-19

## Context

The initial application shipped English first, but many UI labels and educational strings were embedded directly inside React components. That makes translation work error-prone, mixes presentation copy with component behavior, and makes it harder to audit whether a future locale is complete.

## Decision

User-facing English product copy is centralized in `apps/web/src/i18n/en.ts` and consumed by feature components.

The locale module includes navigation, onboarding, converter, batch, history, references, formulas, settings, About, status/error text, and accessible labels. Stable machine identifiers such as `UnitId`, storage keys, backup schema fields, and Rust enum variants are not localized.

Executable temperature conversion formulas remain exclusively in Rust. Educational formula strings can be localized because they are explanatory presentation content, but localization must not change the canonical engine behavior.

## Consequences

### Positive

- Additional locale modules can follow one visible structure.
- UI copy changes are reviewable without searching every component.
- Behavior tests stay attached to stable component semantics.
- Translation work does not affect the domain engine.

### Trade-offs

- `en.ts` is intentionally larger because it is the English catalog.
- Some scale metadata still lives in `data/units.ts`; it may move behind locale data when a second language requires translated descriptions.

## Follow-up rules

- New visible product copy should be added to the locale catalog rather than embedded in a component unless it is truly dynamic domain output.
- Stable IDs and persisted values must never be translated.
- New locales should preserve accessible names and meaning, not merely literal text.
- Add locale completeness checks if more than one shipped locale is introduced.
