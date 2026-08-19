# Development

ThermoShift is organized around one canonical Rust temperature engine, a thin WebAssembly adapter, a React/TypeScript PWA, and a Tauri 2 desktop shell. Keep behavior changes small, explicit, testable, and separated by responsibility.

## Domain-first changes

Executable conversion formulas and physical validation belong in `crates/thermoshift-core`.

When changing conversion behavior:

1. update the Rust domain model/logic;
2. add or update canonical, boundary, pairwise, and invariant regression tests;
3. expose only the minimal mapping through the WASM/Tauri adapters;
4. update UI metadata/copy where required;
5. add user-facing regression coverage;
6. update documentation when behavior or contracts change.

Do not duplicate executable formulas in React merely to make the UI convenient. Educational equations may be displayed in UI copy, but the Rust engine remains the executable source of truth.

## Web architecture

Use the existing boundaries:

- `src/components/` — cohesive UI/product surfaces;
- `src/data/` — reusable static product/domain metadata;
- `src/hooks/` — reusable React behavior such as dialog focus management;
- `src/i18n/` — externalized user-visible product copy;
- `src/lib/` — browser/infrastructure boundaries such as storage, backup, export, PWA updates, logging, and engine loading;
- `src/generated/thermoshift_wasm/` — generated WebAssembly glue, ignored from source control;
- `App.tsx` — screen-level composition and explicit application-state wiring.

Keep stable storage keys, backup schema field names, unit IDs, and Rust identifiers non-localized.

## Generated WebAssembly

Build the browser bridge with:

```bash
npm --workspace @thermoshift/web run wasm:build
```

Generated WASM/JavaScript adapter files must not be hand-edited.

## Local persistence and backup contracts

Current browser-managed keys are versioned independently:

- `thermoshift.settings.v1`;
- `thermoshift.history.v1`;
- `thermoshift.onboarding.v1`.

Full-data backup files use their own `schemaVersion: 1` contract.

When changing persisted data:

- define compatibility/migration behavior before changing the shape;
- treat imported files as untrusted input;
- validate before replacing application state;
- keep bounded retention/input sizes;
- add malformed/old/new schema tests;
- update privacy/architecture/release documentation.

Never silently reinterpret incompatible persisted data.

## Accessibility requirements for changes

Every new interaction must remain usable without a pointer. Preserve:

- semantic controls/landmarks;
- visible focus;
- meaningful accessible names;
- status/error announcement semantics;
- non-color-only states;
- reduced-motion behavior;
- dialog focus containment;
- scalable/responsive layouts and touch-friendly targets.

Add a regression test for an accessibility defect when practical. Use Playwright/axe for primary screen-level coverage and Testing Library for component behavior.

## Structured diagnostics

`apps/web/src/lib/logger.ts` emits local structured console records only. Operational code must use that redaction boundary instead of logging arbitrary metadata directly.

Never intentionally log tokens, credentials, authorization/cookie values, contact details, conversion values, backup contents, or arbitrary user content.

## PWA updates

Application update state is owned by `src/lib/pwaUpdate.ts` and connected to the service-worker lifecycle in the entry point. Conversion must not depend on update/network availability.

When changing update behavior, cover online/offline/unavailable/error states and keep user-facing text in the locale module.

## Quality commands

Repository metadata/documentation:

```bash
npm run check:versions
npm run check:desktop-config
npm run check:docs
```

Rust:

```bash
cargo fmt --all -- --check
cargo test -p thermoshift-core
cargo clippy -p thermoshift-core -p thermoshift-wasm --all-targets -- -D warnings
```

Web:

```bash
npm --workspace @thermoshift/web run typecheck
npm --workspace @thermoshift/web run lint
npm --workspace @thermoshift/web run test
npm --workspace @thermoshift/web run build
npm run check:web-budget
```

Browser E2E/accessibility:

```bash
npx playwright install chromium firefox webkit
npm --workspace @thermoshift/web run e2e
npm --workspace @thermoshift/web run e2e:cross-browser
```

The primary E2E suite covers the fuller Chromium desktop/mobile journey. The cross-browser compatibility suite separately exercises real conversion, history persistence, and axe checks in Chromium, Firefox, and WebKit so one browser engine cannot silently stand in for all supported web targets.

The top-level Makefile mirrors these concepts with targets such as `metadata`, `lint`, `test`, `budget`, `e2e`, `e2e-cross-browser`, `screenshots`, and `desktop-check`.

## Screenshot development

Release/product screenshots must come from the real production/WASM-backed app. Use:

```bash
npm --workspace @thermoshift/web run screenshots
npm run check:screenshots
```

Do not hand-create placeholder images and present them as product captures. See `docs/release-evidence.md`.

## Desktop development

Before native work:

```bash
npm run check:desktop-config
cargo check -p thermoshift-desktop
```

On a machine with the current Tauri prerequisites:

```bash
npm run desktop:dev
npm run desktop:build
```

The repository also defines a manual unsigned Windows/macOS/Linux packaging matrix. A successful build on one platform does not prove another platform works.

Generate platform icon assets from the editable SVG with:

```bash
npm --workspace @thermoshift/desktop run icons
```

Do not commit signing or notarization credentials.

## Dependencies and lockfiles

Do not hand-edit npm/Cargo lockfiles. See `docs/dependency-lockfiles.md`.

Until the current candidate actually contains generated `package-lock.json` and `Cargo.lock`, ordinary dependency resolution remains the documented floating-resolution path. Once native tooling commits both lockfiles, switch reproducibility-sensitive CI/release commands to `npm ci` and Cargo `--locked` in one reviewed change.

## Security changes

For public security hardening, include tests or reproducible evidence where feasible. Sensitive unpatched vulnerabilities must follow `SECURITY.md`, not a public issue.

Repository automation includes CodeQL, dependency audits, and Gitleaks secret scanning. Do not weaken or bypass these checks simply to merge a candidate.

## Conventional commits

Use small meaningful Conventional Commits where practical. Prefer one behavior/refactor/test/documentation/build concern per commit when the changes are separable.

Before each commit, run the smallest relevant verification available. Before a milestone/release candidate, run the complete quality/security/platform evidence defined in `docs/release.md` and `docs/release-evidence.md`.

Do not create empty commits, meaningless one-line churn solely to inflate history, or combine unrelated changes simply to reduce commit count. Keep `what_changed.md` synchronized at meaningful continuation checkpoints.