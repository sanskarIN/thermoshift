# ADR 0002: Keep user settings and history local-first

- Status: Accepted
- Date: 2026-08-19

## Context

Temperature conversion does not require an account or remote database. Adding a backend would increase privacy, security, reliability, and maintenance burden without improving the core workflow.

## Decision

Store small user preferences and explicitly saved history in versioned browser local storage. Provide export files for user portability. Do not add analytics or account infrastructure by default.

## Consequences

Data does not automatically synchronize between devices. Browser site-data clearing removes local state. A future sync feature would require a separate privacy/security design review rather than silently changing this model.
