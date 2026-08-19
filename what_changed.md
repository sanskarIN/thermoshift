# ThermoShift final v0.2 handoff

## Candidate identity

- Repository: `sanskarIN/thermoshift`
- Branch: `build/thermoshift-v0.2`
- Pull request: `#11` — `feat: complete ThermoShift v0.2 reliability layer`
- Base: `main` at `648662788597dcfbbc0db7eb9021f1863c764fb5`
- Source version: `0.2.0`
- Pre-final-handoff head: `65f40690bbf63c741872559b8cc1b63c200be301`
- Pre-final-handoff PR state: open, non-draft, mergeable, not merged
- Pre-final-handoff PR size: 299 commits, 143 changed files, 21,003 additions, 487 deletions
- Release state: untagged release candidate; not yet a verified stable release

This file update creates one additional documentation commit after the pre-final-handoff head above. Earlier detailed checkpoints remain available in Git history.

## Final source audit outcome

The v0.2 branch now contains the intended product implementation and a broad reliability/release-readiness layer. The final audit did not find current TODO/FIXME/HACK source markers that represent unfinished product work. Remaining items are exact-candidate release evidence and repository/platform administration rather than missing core temperature-converter features.

The audit deliberately does not claim that every possible defect is impossible or that unexecuted hosted workflows passed. Exact verification status is recorded below.

## Product implementation present

ThermoShift has one canonical Rust temperature engine exposed to the browser through WebAssembly and reused by the Tauri desktop target. The engine supports Celsius, Fahrenheit, Kelvin, Rankine, Réaumur, Delisle, Newton, and Rømer; validates finite input and absolute-zero boundaries; and includes dense pairwise conversion invariants and Unicode-aware unit parsing.

The React/PWA product includes instant conversion, batch conversion, configurable precision/rounding, reference cards, formula education, local history, history search/filter/delete/clear/undo, CSV/JSON export, copy/share behavior, first-run onboarding, Quick Actions, keyboard page shortcuts, local-only settings, theme/high-contrast/reduced-motion controls, service-worker update controls, About/support surfaces, and offline-first behavior.

Browser persistence is versioned and bounded. Full backup/restore uses an independently versioned schema, a 256 KiB input ceiling, strict all-or-nothing validation, duplicate-ID rejection, settings/history validation, and a 50-record history limit.

Accessibility hardening includes semantic status/error behavior, skip navigation, dialog focus containment/recapture/restoration, keyboard navigation, page-change announcements, synchronized document titles, `aria-keyshortcuts`, reduced-motion support, and automated axe coverage in the browser suites.

Operational failures use localized/generic user-facing messages while structured local diagnostics redact credential/session/contact/content/value-shaped metadata and reduce Error objects to safe type information.

## Final numeric correctness fix

The final audit found a real presentation-layer decimal rounding defect: binary floating-point scaling could make `half-up` rounding produce the wrong result for values such as `1.005`.

`apps/web/src/lib/format.ts` now uses decimal exponent shifting rather than direct binary multiplication for decimal rounding. The same 0–12 precision clamp is shared by rounding and `Intl.NumberFormat`, negative zero is normalized, truncation behavior is preserved, and very large finite values are preserved when presentation-only decimal shifting would overflow.

Regression coverage now includes:

- `1.005` at two decimal places → `1.01`;
- `-1.005` at two decimal places → `-1.01`;
- positive/negative ordinary halves;
- positive/negative truncation;
- precision clamping;
- `Number.MAX_VALUE` overflow protection;
- out-of-range formatting precision not throwing.

The corrected algorithm was additionally sanity-checked directly with Node for these representative values. That direct check is supplemental and is not a substitute for the repository's full Vitest/TypeScript/CI run.

## Reproducible dependency state

Both package-manager lockfiles are committed:

- `package-lock.json`;
- `Cargo.lock`.

Normal verification now fails closed if those committed graphs disappear:

- pull-request CI uses `npm ci --ignore-scripts` and Cargo `--locked`;
- cross-browser E2E uses `npm ci --ignore-scripts`;
- dependency security audits require committed lockfiles;
- Makefile setup/test/lint/desktop-check paths are locked;
- screenshot/native/release workflows consume the committed graphs.

`Refresh Lockfiles` is a manual-only maintenance workflow for intentional dependency graph changes.

## Desktop branding/configuration state

The generated Tauri icon set is committed, including the primary PNG assets plus Windows `icon.ico` and macOS `icon.icns`.

`scripts/check-desktop-config.mjs` verifies:

- Tauri web workspace/frontend paths;
- dev URL;
- application identifier;
- main-window capability scope;
- minimal capability permissions;
- CSP bounds/no wildcard or broad remote HTTP(S) sources;
- the expected Tauri icon generation command;
- required primary generated icon files are present and non-empty;
- editable SVG logo source exists.

`Refresh Desktop Icons` is manual-only and uses the committed npm graph.

## Exact-head generated evidence invariant

A release-evidence race was found in the lockfile/icon/screenshot workflows. They previously created generated output and then used `git pull --rebase` before pushing. If the branch advanced, output produced from an older candidate could have been rebased onto newer source and mistaken for exact-candidate evidence.

This is fixed in all three workflows:

- `Refresh Lockfiles`;
- `Refresh Desktop Icons`;
- `Verified Product Screenshots`.

After creating a generated commit, each workflow now fetches the remote branch and compares the generated commit's parent with the current remote head. If the branch advanced, the workflow fails and requires regeneration from the new head. Generated dependency metadata, branding, and product screenshots are never rebased forward onto newer source.

`docs/release.md` documents this invariant explicitly.

## Release provenance hardening

`scripts/create-release-manifest.mjs` already required candidate SHA/ref identity, hashed required release evidence, verified the web archive checksum, constrained archive/checksum/output paths to the repository root, and emitted a SHA-256 provenance manifest.

The final audit hardened identity validation further:

- candidate SHA must be a full 40- or 64-character hexadecimal Git object ID;
- candidate ref must be non-empty, trimmed, and single-line;
- emitted SHA is normalized to lowercase;
- malformed SHA/ref regression tests are included.

This prevents meaningless or malformed candidate identity text from being published as provenance metadata.

## Security/release automation state

The repository defines:

- CI with Rust format/test/Clippy, web typecheck/lint/test/build, metadata/config/docs checks, asset budget, and primary Playwright E2E;
- separate Chromium/Firefox/WebKit compatibility matrix;
- CodeQL;
- Gitleaks;
- RustSec and npm audit;
- Dependabot;
- fail-closed stable-tag release workflow;
- release-input preflight;
- real-product screenshot generation/validation workflow;
- unsigned Linux/Windows/macOS Tauri build-evidence workflow;
- release archive/checksum/provenance generation.

A workflow definition is not evidence that the exact candidate passed it.

## Documentation synchronized

The final pass aligned the repository documentation with the actual committed candidate instead of older pre-lock/pre-icon checkpoints. Relevant maintained documentation includes:

- `README.md`;
- `CHANGELOG.md`;
- `ROADMAP.md`;
- `CONTRIBUTING.md`;
- `SECURITY.md`;
- `PRIVACY.md`;
- `docs/setup.md`;
- `docs/development.md`;
- `docs/testing.md`;
- `docs/performance.md`;
- `docs/architecture.md`;
- `docs/dependency-lockfiles.md`;
- `docs/release.md`;
- `docs/release-evidence.md`;
- `docs/repository-settings.md`;
- ADRs under `docs/adr/`.

README/setup/development/contribution/testing examples now use locked installs/checks where appropriate. CHANGELOG and ROADMAP no longer incorrectly list committed lockfiles or Windows/macOS icon assets as missing.

## Finalization commits from this continuation

The continuation added meaningful atomic commits rather than one large rewrite:

- `44204b349bdb65b0c4da70c2bf87707bf75c74c4` — `ci(lockfiles): make regeneration manual only`
- `493d723016617e1197a43190340b40f6c0a3b10b` — `ci(desktop): make icon regeneration manual only`
- `78d759b7ec8b0c04e714802df814b8d705abe350` — `ci: require committed dependency lockfiles`
- `a247a6b96c5e90a85a4bd3e78aea7d8a6c1c2ca3` — `ci(e2e): require locked browser dependencies`
- `5aeabb068d6775545df6c02402b49bd615b6a055` — `ci(security): audit committed dependency graphs`
- `746300f3b2e600400e7a3b063484b5e7f1c471f7` — `build(desktop): verify committed icon artifacts`
- `83589266cf619d54f94621cddbded6742dbb5ad5` — `docs(readme): align dependency and icon state`
- `9dfe5d89762bf12d19a7f7dd3d4e93cda3f3971b` — `docs(setup): require locked dependency install`
- `3c27337085823cb6574fa4cd924898385d82a51f` — `docs(development): standardize locked verification`
- `4762562b4d2dc70030e23c079fcc1ec9a5c4a3f7` — `docs(changelog): record reproducibility completion`
- `72a325a9e5c7afebd74b0143c404a2d59e374ef3` — `docs(roadmap): close generated-input blockers`
- `1e81dbd8a0b8db4773f7a65d432be476ba772333` — `build: enforce locked Makefile verification`
- `6235d04989bc1e9e5e11b9d074cda8206d490f7c` — `docs(contributing): use locked quality commands`
- `77ce412b840ddf617796c08f35ff3e9a80c159a2` — `docs(testing): align locked and icon verification`
- `92e0a9ee993bdc1bdf25b936d7b269d9798254a0` — `docs(handoff): refresh final v0.2 candidate state`
- `d2eb8fbda189e2fb0690e10ee3919f60ab91bc28` — `ci(lockfiles): prevent stale evidence rebases`
- `107c5adf7cf0153d28ad32a89796a509c4fad57c` — `ci(desktop): prevent stale icon rebases`
- `374823f024368bfbd61c15776ebfaeae13bbb859` — `ci(screenshots): prevent stale capture rebases`
- `654e467f1f80685d10f0c55c1fd305ee14a80a52` — `docs(release): require exact-head generated evidence`
- `4ef7ac0429717623785f067b5cf8dbbdbdcecef5` — initial decimal-rounding hardening attempt, immediately superseded after detecting its magnitude-scaled epsilon weakness
- `73458373ae0869777838fed2a49ba6d939538718` — `fix(format): avoid magnitude-scaled rounding epsilon`
- `12b9de64486815ca936135705aa7d2c05525505a` — `test(format): cover decimal and magnitude edges`
- `eb3a1075916a22743b240cd9f847483a32f97dd7` — `build(release): validate provenance commit identity`
- `75f89d5b04d118111786561bd42a9d0d94f8a755` — `test(release): reject malformed provenance identity`
- `65f40690bbf63c741872559b8cc1b63c200be301` — `docs(changelog): record final audit hardening`

This handoff update adds one further documentation commit after the list above.

## Verification evidence still open

These items remain intentionally open and must not be represented as passed without exact-candidate evidence:

1. The eight verified real product screenshots under `docs/screenshots/` are not committed yet.
2. Current exact-head hosted CI, Cross-browser E2E, CodeQL, Gitleaks, RustSec, and npm-audit results still need an actual completed run/review.
3. Unsigned Linux, Windows, and macOS native bundle evidence still needs to be produced/reviewed for the exact candidate SHA.
4. Representative real-device/browser PWA install/offline/update evidence remains a release-plan check.
5. Intended `main` branch protection/rulesets and optional Discussions/labels/milestones are GitHub administration settings and must be configured/reviewed outside source files.
6. Signing/notarization remains owner-controlled and intentionally outside Git.
7. `v0.2.0` must not be tagged/published until the exact release evidence is complete; published archive/provenance checksums must then be verified.

## Final continuation order

When release evidence can be executed on the exact unchanged candidate:

1. run the manual verified-screenshot workflow and commit only real validated captures;
2. review exact-head CI/Cross-browser/CodeQL/Gitleaks/RustSec/npm-audit results and fix any real failure with regression coverage;
3. run/review the unsigned Linux/Windows/macOS package matrix for the same candidate SHA;
4. record required real-device/browser PWA evidence;
5. configure/review repository administration settings as intended;
6. configure owner-controlled signing/notarization if signed desktop publication is planned;
7. update `docs/release-evidence.md` with evidence tied to the exact unchanged candidate;
8. only then tag/publish `v0.2.0` and verify the archive checksum, provenance manifest/checksum, and release notes.

Do not create placeholder screenshots/evidence, hand-author lockfile integrity data, bypass failing quality/security gates, or merge/tag solely because the source implementation appears complete.
