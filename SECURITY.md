# Security Policy

## Supported versions

Security fixes target the latest released minor version and the current `main` branch. Development branches are supported only while their pull request is active and should not be described as a released version.

## Reporting a vulnerability

Prefer GitHub private vulnerability reporting from the repository Security tab when available. If private reporting is unavailable, email `sanskarin@outlook.in` with the subject `ThermoShift security report`.

Do not open a public issue for an unpatched vulnerability. Include the affected version/commit, reproduction conditions, realistic impact, and any suggested remediation. Do not include unrelated private data, access tokens, credentials, or third-party personal information.

## Security model

ThermoShift has no required backend, authentication service, cloud account, or server-side conversion path. Core conversion is local computation in the canonical Rust engine.

The browser/PWA treats imported backup files as untrusted input. Full backups are bounded to 256 KiB, schema-versioned, and completely validated before state replacement. Known validation failures use a dedicated `BackupValidationError` boundary so safe validation guidance can be shown to the user. Unexpected file-read/runtime failures are not echoed back with raw browser error details; they are routed through the redacted local diagnostic boundary and Settings shows a generic restore failure message instead.

Interactive batch conversion is also bounded before conversion work. Input above 32,768 characters or 1,000 lines is rejected before the per-line conversion loop, limiting avoidable CPU/DOM pressure from accidental paste floods.

Clipboard and Web Share integrations are treated as operational browser boundaries rather than trusted sources of user-facing text. Rejected browser promises do not have their raw `Error.message` echoed into the UI. The app emits only localized generic outcomes and passes failure objects through the redacted local logger. A native Web Share `AbortError` is treated as user cancellation and is neither displayed as a failure nor logged as a warning.

The desktop application uses a minimal Tauri capability set. Desktop web content is constrained by the Content Security Policy in `apps/desktop/src-tauri/tauri.conf.json`. Tauri frontend paths are checked by `npm run check:desktop-config` so packaging cannot silently point at the wrong workspace.

Operational diagnostics are local-only structured console records. Metadata passes through a redaction layer before serialization; credential/session, contact/identity, content, input/output, and value-shaped fields are redacted, Error objects are reduced to their type for logged metadata, and collection/depth/string sizes are bounded. ThermoShift does not intentionally send those diagnostic records to a remote service.

## Automated security checks

Repository automation includes:

- GitHub CodeQL for JavaScript/TypeScript static analysis;
- Gitleaks repository secret scanning;
- RustSec dependency auditing;
- npm vulnerability auditing at high severity or greater;
- Dependabot update configuration;
- Rust formatting, Clippy, and domain tests in CI;
- TypeScript checking, ESLint, Vitest coverage, PWA production build, Playwright/axe checks, Chromium/Firefox/WebKit compatibility smoke tests, and production-asset budgets;
- regression tests for trusted backup-validation failures and generic handling of unexpected backup file-read errors;
- regression tests for clipboard/share success, fallback, cancellation, redacted logging, and generic rejected-promise UI outcomes;
- manifest-version and desktop-path consistency checks;
- tagged-release version/tag consistency checks, three-engine browser compatibility, and SHA-256 web artifact/provenance checksum generation.

Passing automation reduces risk but does not replace review of new permissions, CSP changes, file-import paths, external network behavior, logging fields, dependencies, resource-boundary changes, or release credentials.

## Secrets and release credentials

Never commit passwords, signing keys, tokens, API keys, notarization credentials, private endpoints, production secrets, or user data. `.env.example` intentionally contains placeholder names only.

Desktop signing/notarization must use owner-controlled secrets supplied by secure CI/release infrastructure or the native platform environment. Signed desktop release automation should not be enabled until those credentials and platform-specific review procedures exist.

## Dependency and disclosure hygiene

Keep dependency changes small and review upstream release/security notes when upgrading critical build, PWA, WebAssembly, or desktop-packaging dependencies. A dependency alert is not automatically exploitable in ThermoShift, but high-severity findings should be investigated before a release candidate is tagged.

For responsible disclosure questions, contact `sanskarin@outlook.in`.