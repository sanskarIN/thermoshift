# GitHub Repository Settings Baseline

This document records the recommended repository-level configuration for ThermoShift. These controls live in GitHub settings rather than source code, so their presence in this file is guidance and review criteria—not a claim that every setting is currently enabled.

## Default branch

Use `main` as the default branch. Feature and release-candidate work should arrive through pull requests rather than direct history rewriting.

## Recommended branch protection for `main`

Enable a branch protection rule or ruleset that, at minimum:

- requires a pull request before merging;
- prevents force pushes and branch deletion;
- requires conversation resolution before merge;
- requires the meaningful CI/security checks used by the repository once their check names are stable;
- dismisses stale approvals when the code under review changes, if review approvals are required;
- applies the same release-quality expectations to administrators unless an emergency process is explicitly documented.

Suggested required checks after their workflow names have been observed on `main`/pull requests:

- CI metadata/configuration/documentation-link verification;
- Rust format/test/Clippy job;
- web type/lint/test/build/budget job;
- browser E2E/accessibility job;
- CodeQL;
- dependency/security audit jobs, including secret scanning.

Do not configure a required check under a guessed name. First let the workflow run successfully, then select the exact check name exposed by GitHub.

## Merge policy

ThermoShift intentionally uses small meaningful commits. For substantial milestone pull requests, prefer a merge commit when preserving those reviewable commits is useful. Do not require squashing solely to reduce visible history.

Rebase/merge choices for ordinary small contributions may follow maintainer judgment as long as authorship and review history remain clear.

## GitHub Discussions

If Discussions is enabled, use it for community questions, ideas, usage help, and broader design conversations that are not confirmed defects or concrete implementation tasks.

Suggested categories:

- Announcements — maintainer release/project notices;
- Q&A — usage and development questions;
- Ideas — feature/product discussion before an issue is actionable;
- Show and tell — community integrations, screenshots, or educational uses;
- General — project discussion that does not fit a more specific category.

Security reports must never be redirected to public Discussions. Follow `SECURITY.md`.

## Labels

Keep labels small and useful. Suggested baseline:

- `bug` — confirmed or reproducible defect;
- `enhancement` — product improvement or new capability;
- `accessibility` — keyboard, semantic, contrast, motion, zoom, or assistive-technology work;
- `security` — non-sensitive security hardening or public remediation tracking;
- `performance` — measurable size/latency/resource work;
- `documentation` — docs-only or docs-dominant changes;
- `dependencies` — dependency/toolchain maintenance;
- `platform:web`, `platform:windows`, `platform:macos`, `platform:linux` — platform-specific work;
- `needs-reproduction` — insufficient evidence for a defect yet;
- `good first issue` and `help wanted` — only when the scope is genuinely contributor-ready;
- `release-blocker` — must be resolved or explicitly waived before the target release.

Avoid overlapping label synonyms that make issue triage ambiguous.

## Milestones

Use milestones only when they represent a real release or bounded engineering objective. Suitable examples:

- `v0.2.0` — reliability/usability release candidate;
- `v1.0.0` — first stable release.

A milestone is planning metadata, not release evidence. Closing a milestone does not replace test, security, packaging, or release verification.

## Security features

Where the repository/account plan supports them, enable:

- Dependabot alerts and security updates;
- secret scanning / push protection where available;
- private vulnerability reporting.

The repository also keeps source-controlled CodeQL, Gitleaks, RustSec/npm audit, and Dependabot configuration so security expectations remain visible in review.

## Release settings

Do not publish or tag `v0.2.0` merely because source metadata contains `0.2.0`. Follow `docs/release.md` and `docs/release-evidence.md`; the tag is the result of release-candidate verification, not a way to start it.
