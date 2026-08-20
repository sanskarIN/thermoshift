# ADR 0005 — Externalized product copy

- **Status:** Accepted
- **Date:** 2026-08-19

## Context

The initial application shipped English first, but many UI labels and educational strings were embedded directly inside React components. That makes translation work error-prone, mixes presentation copy with component behavior, and makes it harder to audit whether a future locale is complete.

Validation/infrastructure boundaries create the same risk when they throw human-readable strings that are later displayed directly. A parser should communicate machine-stable failure meaning to the presentation layer rather than becoming the owner of English product copy.

## Decision

User-facing English product copy is centralized in `apps/web/src/i18n/en.ts` and consumed by feature components.

The locale module includes navigation, onboarding, converter, batch, history, references, formulas, settings, About, status/error text, validation guidance, and accessible labels. Stable machine identifiers such as `UnitId`, storage keys, backup schema fields, backup validation codes, and Rust enum variants are not localized.

The backup parser illustrates the boundary: it emits a typed `BackupValidationError` with a stable validation code and no reflected untrusted schema detail. Settings maps that code to locale-owned guidance. Unexpected operational restore failures bypass validation guidance and use generic localized failure copy while diagnostics remain behind the redaction boundary.

Executable temperature conversion formulas remain exclusively in Rust. Educational formula strings can be localized because they are explanatory presentation content, but localization must not change the canonical engine behavior.

## Consequences

### Positive

- Additional locale modules can follow one visible structure.
- UI copy changes are reviewable without searching every component or parser.
- Behavior tests can assert stable machine codes separately from localized presentation text.
- Untrusted external values do not need to be reflected into translated error messages.
- Translation work does not affect the domain engine or backup parsing contract.

### Trade-offs

- `en.ts` is intentionally larger because it is the English catalog.
- Presentation code needs a small mapping from stable validation/status codes to locale text.
- Some scale metadata still lives in `data/units.ts`; it may move behind locale data when a second language requires translated descriptions.

## Follow-up rules

- New visible product copy should be added to the locale catalog rather than embedded in a component or infrastructure layer unless it is truly dynamic domain output.
- Validation/parsing libraries should expose stable typed codes or structured outcomes rather than English strings when the result is intended for user presentation.
- Do not reflect arbitrary untrusted input into user-visible validation copy unless there is a specific reviewed need and safe encoding/length policy.
- Stable IDs, error codes, and persisted values must never be translated.
- New locales should preserve accessible names and meaning, not merely literal text.
- Add locale completeness checks if more than one shipped locale is introduced.
