# ThermoShift Handoff — `what_changed.md`

## Current milestone

**Project:** ThermoShift  
**Source version:** `0.2.0`  
**Branch:** `build/thermoshift-v0.2`  
**Pull request:** #11 — `https://github.com/sanskarIN/thermoshift/pull/11`  
**Base branch:** `main`  
**Base/merge-base SHA:** `648662788597dcfbbc0db7eb9021f1863c764fb5`  
**Pre-handoff branch head:** `aabcca99c66ba296e36452e400fe2af6f1fe2f21`  
**Pre-handoff compare:** **164 commits ahead, 0 behind**  
**Pre-handoff PR diff:** **78 changed files, 4454 additions, 438 deletions**  
**PR state:** open, non-draft, mergeable, not merged  
**Release state:** untagged release-candidate implementation; do **not** call v0.2.0 stable/released yet.

This handoff commit is written after the statistics above, so it adds one additional meaningful documentation commit beyond that exact pre-handoff compare snapshot.

---

## Critical source-of-truth correction

Earlier handoff/PR text in this development history temporarily overstated release evidence by referring to committed dependency lockfiles and completed lock-backed/native verification that the current GitHub branch does **not** actually contain.

That mismatch has been corrected.

The current GitHub branch is the source of truth. At the pre-handoff checkpoint:

- `package-lock.json` is **not present**;
- `Cargo.lock` is **not present**;
- `apps/desktop/src-tauri/icons/icon.ico` and the generated Tauri icon directory are **not present**;
- `docs/screenshots/converter-desktop.png` and the expected generated screenshot set are **not present**;
- current PR CI/CodeQL/security runs are **not green**; they are still queued/pending;
- no stable `v0.2.0` tag/release has been created;
- Windows/macOS/Linux native package success is not inferred from workflow definitions;
- signing/notarization is not configured or claimed.

The PR #11 description has also been corrected so it no longer claims missing lockfiles or unproven platform/check results.

No generated lockfile, icon, product screenshot, native bundle, security result, or stable release status should be claimed until the corresponding exact-candidate file/result actually exists.

---

## Repository history already preserved

- Original public repository history and MIT licensing were retained.
- ThermoShift 0.1 foundation was implemented through meaningful atomic feature commits.
- Pull request #1 was merged without squashing the meaningful implementation history.
- PR #1 merge commit: `21638734e7d326b605975eef27c24b74e409f4a8`.
- The previous `main` implementation checkpoint is `648662788597dcfbbc0db7eb9021f1863c764fb5`.
- v0.2 work is isolated on `build/thermoshift-v0.2` and PR #11.
- The v0.2 branch remains 0 commits behind the base at the pre-handoff compare checkpoint.

---

# v0.2 implementation completed in source

## 1. Canonical Rust temperature engine remains the source of truth

ThermoShift continues to keep executable conversion formulas and physical validation in `crates/thermoshift-core`.

Supported scales remain:

- Celsius;
- Fahrenheit;
- Kelvin;
- Rankine;
- Réaumur;
- Delisle;
- Newton;
- Rømer.

Core behavior includes:

- finite-value validation;
- absolute-zero validation;
- normalized zero-K handling around the validation epsilon;
- canonical conversions through Kelvin;
- all-scale round-trip coverage;
- dense invariant coverage across **0–5000 K** for every source/destination pair;
- scale-direction coverage including intentionally reversed Delisle behavior.

The React application, educational formula copy, and platform adapters do not become alternate executable formula engines.

## 2. Unicode-aware unit parsing hardening

A real parser defect was found during this continuation.

`Unit::from_str` previously used `to_ascii_lowercase()`, which accepted lowercase accented forms such as `réaumur` and `rømer` but could reject uppercase accented inputs such as:

- `RÉAUMUR`;
- `RØMER`;
- `°RÉ`;
- `°RØ`.

The parser now uses Unicode-aware lowercase normalization.

Regression tests now cover:

- scale names;
- symbols;
- aliases;
- surrounding whitespace;
- uppercase accented names/symbols;
- preservation of the original unknown unit input in `TemperatureError::UnknownUnit`.

## 3. Browser local persistence remains forgiving and bounded

`apps/web/src/lib/storage.ts` continues to use versioned local keys:

- `thermoshift.settings.v1`;
- `thermoshift.history.v1`;
- `thermoshift.onboarding.v1`.

Local-storage recovery is intentionally forgiving so malformed cached preferences do not prevent application startup.

Current local persistence behavior includes:

- default-safe settings recovery;
- per-field settings sanitization;
- 50-entry history retention limit;
- history record validation;
- history timestamp validation;
- finite numeric input/output validation;
- supported unit ID validation;
- duplicate history ID removal during local-cache recovery;
- onboarding state stored separately from normal settings/history;
- browser storage read/write/remove failures caught instead of crashing the running converter;
- storage failures sent only through the local redacted structured logger.

A new strict `isSettings` validator is now separate from forgiving `sanitizeSettings`, allowing imported files to be validated differently from damaged local cache state.

## 4. Versioned full-data backup/restore boundary is now strictly fail-closed

Full backups use `apps/web/src/lib/backup.ts` and independent `schemaVersion: 1`.

A version-1 full backup contains:

- schema version;
- export timestamp;
- settings;
- explicitly saved conversion history.

The backup input ceiling is **256 KiB**.

The UI rejects oversized files before calling `File.text()`.

The parser independently measures encoded byte length and rejects oversized text before JSON parsing.

A real correctness gap was found during this continuation: malformed backup settings and an invalid export timestamp were previously normalized to defaults/epoch-like fallback values. That behavior contradicted the documented strict restore contract.

The parser now rejects, before state replacement:

- oversized input;
- malformed JSON;
- unsupported schema versions;
- missing or invalid export timestamps;
- missing/incomplete/out-of-range settings;
- missing history arrays;
- history beyond 50 records;
- invalid history IDs;
- invalid history timestamps;
- non-finite history values;
- unsupported units;
- duplicate conversion identifiers.

Duplicate IDs are rejected rather than silently dropping one of the imported records.

Restore remains all-or-nothing.

The distinction is deliberate:

- malformed **browser local storage** may recover to safe defaults;
- malformed **external backup files** fail closed and are not silently rewritten into different accepted data.

This distinction is now documented in ADR 0004, architecture, privacy, testing, release, changelog, and README materials.

## 5. Backup regression coverage expanded

Parser-level tests now cover:

- round-trip valid backup data;
- malformed JSON;
- byte-limit rejection;
- unsupported schema versions;
- invalid/missing export timestamps;
- malformed settings;
- invalid history rows;
- duplicate history identifiers.

Storage tests now cover the strict full `Settings` validator separately from local-storage sanitization.

Settings UI tests also prove malformed imported settings surface an error and do not call the restore callback.

## 6. First-run onboarding

The accessible first-run flow remains implemented.

It communicates:

- eight supported scales;
- local-first operation;
- offline-first behavior;
- no account requirement;
- locally stored history/preferences.

Users can:

- start converting;
- open Settings first.

Onboarding completion is persisted independently.

Resetting ThermoShift local data restores onboarding.

## 7. Quick Actions and keyboard workflow

Quick Actions remains available through:

- `Ctrl+K` on Windows/Linux;
- `⌘+K` on macOS;
- searchable action/page list;
- semantic button/list interaction;
- Escape dismissal;
- focus containment/restoration.

Direct page shortcuts remain:

- `Alt+1` Converter;
- `Alt+2` Batch;
- `Alt+3` History;
- `Alt+4` Formulas;
- `Alt+5` Settings;
- `Alt+6` About.

## 8. Global keyboard/modal behavior was hardened further

Two additional accessibility/usability defects were found during this continuation.

Previously:

1. `Alt+1…6` could navigate while focus was inside an editable form control;
2. global shortcuts could change/open background UI while onboarding or Quick Actions owned modal interaction.

Current rules are now explicit:

- `Ctrl/⌘+K` remains intentionally global from normal editable controls after onboarding;
- `Alt+1…6` does not navigate when the event target is `input`, `textarea`, `select`, or `contenteditable`;
- onboarding blocks Quick Actions/background global shortcut navigation;
- Quick Actions blocks background Alt page navigation while open.

Application-level tests cover these behaviors.

## 9. Reusable dialog focus containment

`useDialogFocusTrap` remains the shared modal interaction primitive.

Covered behavior includes:

- initial focus placement;
- Tab wrapping;
- Shift+Tab wrapping;
- Escape handling where supported;
- focus restoration after unmount/close;
- modal keyboard ownership.

## 10. Converter UX/accessibility hardening

Converter behavior includes:

- finite numeric input validation;
- Rust absolute-zero errors;
- `aria-invalid` while invalid;
- conditional error-description relationship;
- stale share/copy notice reset after value/unit changes;
- separate share/copy-fallback success messages;
- displayed selected-scale physical minimum;
- saved conversion history action;
- no server dependency.

## 11. Reference scale selector

Educational reference cards can display in any supported scale instead of a fixed display scale.

Reference content includes clearly labeled educational points such as:

- absolute zero;
- water freezing;
- room-temperature reference;
- approximate human-body reference;
- water boiling.

## 12. History UX

History supports:

- local-only saved conversions;
- search across values, unit names/symbols, and localized timestamps;
- From-scale filter;
- To-scale filter;
- individual deletion;
- clear all;
- undo individual deletion;
- undo clear-all;
- history-only JSON export;
- accessible delete labels;
- 50-entry bounded persistence.

## 13. Formula education

Formula cards contain derivation/explanation notes for the educational relationships presented to users.

Those equations are presentation content. Rust remains the executable conversion source of truth.

## 14. Internationalization-ready product copy boundary

English UI copy is centralized in:

`apps/web/src/i18n/en.ts`

Externalized areas include:

- shell/navigation;
- onboarding;
- Quick Actions;
- converter;
- batch;
- history;
- references;
- formulas;
- Settings;
- update UI;
- About/support;
- status/error copy;
- accessibility labels.

Stable persistence IDs, backup field names, unit IDs, and Rust identifiers remain non-localized.

ADR 0005 records the copy/localization boundary.

## 15. Settings information architecture

Settings includes coherent sections for:

- conversion precision/rounding;
- appearance/accessibility;
- application updates;
- privacy/data backup/restore/reset;
- About/support/project links.

`ProjectLinks.tsx` is reused by Settings and About rather than duplicating contact/support markup.

## 16. PWA update controls

`apps/web/src/lib/pwaUpdate.ts` owns locale-neutral update state.

The application entry point wires service-worker registration state into it.

Settings shows:

- installed application/engine version;
- update readiness/status;
- explicit **Check for updates** action;
- offline/unavailable/checking/checked/error states.

Core conversion never depends on update/network availability.

## 17. PWA update error privacy was hardened

A real failure-path inconsistency was fixed during this continuation.

Previously, the update state could carry a raw browser `Error.message` and Settings appended that detail to user-facing copy.

Now:

- update failures still go to `logEvent('warn', 'pwa.update_failed', { error })`;
- the structured logger redacts/reduces Error data;
- public update state contains only `{ status: 'error' }`;
- Settings shows localized generic `Update service error.` text;
- raw operational error text is not echoed to the user.

Service-level and component tests prove raw failure detail does not appear in public state/UI.

## 18. Startup failure privacy was hardened

The application previously displayed the raw WASM initialization error text on its startup failure screen.

Now:

- the original failure goes through the redacted local structured logger;
- UI state records only a failure flag;
- the user sees localized startup title/recovery guidance;
- raw initialization error detail is not rendered.

An application test intentionally throws a sensitive-looking initialization message and asserts that it does not appear in the rendered alert.

## 19. Local structured diagnostics

`apps/web/src/lib/logger.ts` remains local-console only.

It does not create a remote telemetry/analytics pipeline.

The logger sanitizes metadata before serialization and bounds depth/collections/string sizes.

Sensitive key classes include credential/session-shaped, identity/contact, content, input/output, and value-shaped fields.

Error objects are reduced to safe type information rather than serializing raw Error messages.

Operational use includes engine initialization, service-worker update failure, and browser-storage failure.

## 20. Offline E2E evidence implementation expanded

The Playwright smoke suite now includes additional release-relevant journeys:

- first-run onboarding;
- real WASM-backed `100 °C → 212 °F` conversion;
- Quick Actions keyboard navigation;
- saved history surviving page reload;
- service-worker registration followed by an offline reload;
- conversion continuing while the browser context is offline;
- visible offline status;
- Settings version/update controls;
- axe scan of converter;
- axe scan of onboarding;
- axe scan of Settings.

Configured browser projects remain desktop Chromium and Pixel 7 mobile emulation.

This is implemented test coverage; passing exact-candidate hosted evidence must still come from an actual completed workflow run.

## 21. Dedicated verified screenshot capture suite

Added:

- `apps/web/screenshot.config.ts`;
- `apps/web/screenshots/capture.spec.ts`;
- web script `screenshots`;
- root script `check:screenshots`;
- `scripts/check-screenshot-set.mjs`;
- `.github/workflows/screenshots.yml`.

The screenshot suite uses a real production build/preview server and captures:

- onboarding desktop;
- onboarding mobile;
- converter desktop after real 100→212 conversion;
- converter mobile;
- Settings desktop;
- Settings mobile;
- About desktop;
- About mobile.

The screenshot validator requires:

- exactly eight expected PNGs;
- correct PNG signature;
- nontrivial file size;
- sane desktop dimensions;
- sane mobile dimensions.

The screenshot workflow uploads validated PNGs as short-lived workflow evidence before attempting a Git commit.

**Current evidence state:** the PNG files are still absent from the branch. Do not present a placeholder/mockup as a verified ThermoShift product screenshot.

## 22. Production web asset budget

`check:web-budget` remains enforced in CI/release configuration after production build.

Current documented limits:

- total measured raw runtime assets ≤ **2 MiB**;
- total measured gzip runtime assets ≤ **750 KiB**;
- any JavaScript asset ≤ **750 KiB raw**;
- any WebAssembly asset ≤ **512 KiB raw**.

Source maps are excluded from runtime transfer budgets.

`docs/performance.md` now accurately documents the script, limits, runtime design rationale, and release evidence policy.

## 23. Internal documentation link verification

Added dependency-free:

`scripts/check-doc-links.mjs`

Exposed as:

`npm run check:docs`

The checker recursively scans Markdown while ignoring generated/build dependency directories and validates relative file targets.

It rejects:

- malformed encoded paths;
- repository-escaping paths;
- missing internal targets.

CI metadata and tagged web release workflows now run the documentation-link gate.

## 24. Version consistency gate

`scripts/check-versions.mjs` checks product version alignment across:

- root npm package;
- web npm package;
- desktop npm package;
- Rust core crate;
- WASM crate;
- desktop Tauri Rust package;
- Tauri configuration.

Tracked source version metadata is aligned at `0.2.0`.

A repository search did not surface stale `0.1.0` source references in indexed current code during this continuation.

## 25. Tauri frontend path/configuration gate

A real pre-build path defect found earlier in v0.2 remains fixed.

Tauri pre-development/pre-build commands resolve to the actual `apps/web` workspace from `apps/desktop/src-tauri`.

`scripts/check-desktop-config.mjs` verifies expected frontend paths/configuration so the error cannot silently return.

CI metadata and release workflows run this check.

## 26. Desktop icon generation path

The current Tauri source tree still does not contain generated platform icon assets.

To solve that without hand-authoring binary assets:

- `apps/desktop/package.json` now includes `npm --workspace @thermoshift/desktop run icons`;
- it uses Tauri icon generation from the editable `apps/web/public/logo.svg` source;
- `.github/workflows/icons.yml` generates and verifies required PNG/ICO/ICNS outputs;
- generated icon outputs are uploaded as workflow evidence before the commit attempt;
- commit author configuration is `Sanskar <sanskarin@outlook.in>`.

The workflow currently includes a branch-scoped push-on-itself trigger in addition to `workflow_dispatch` so generation can be started from the feature branch without relying on an unavailable manual-dispatch connector.

**Current evidence state:** `apps/desktop/src-tauri/icons/icon.ico` is still absent. Therefore desktop icon completion remains open.

After generated icons actually land, restore this workflow to manual-only `workflow_dispatch` and add/verify explicit Tauri bundle icon paths if needed.

## 27. Cross-platform unsigned desktop verification workflow

Added:

`.github/workflows/desktop-platforms.yml`

The manual matrix targets:

- Ubuntu 24.04;
- Windows latest;
- macOS 14.

It is designed to:

- install platform prerequisites;
- install Node/Rust/wasm-pack;
- consume committed npm/Cargo locks;
- verify metadata/Tauri config;
- check the desktop Rust crate;
- build unsigned native packages;
- upload `src-tauri/target/release/bundle/**` as short-lived evidence.

Because committed lockfiles are not yet present, this matrix is intentionally not claimed as completed.

Signing/notarization remains a separate owner-controlled publication gate.

## 28. Lockfile generation workflow

Added:

`.github/workflows/lockfiles.yml`

It uses native package-manager tooling:

- `npm install --ignore-scripts --package-lock-only`;
- `cargo generate-lockfile`.

It verifies generated files plus repository version/Tauri configuration, uploads both lockfiles as workflow evidence, then attempts a Git commit using:

`Sanskar <sanskarin@outlook.in>`

The workflow currently contains a branch-scoped push-on-itself trigger in addition to manual dispatch because this connector does not expose a workflow-dispatch action.

**Current evidence state:** both `package-lock.json` and `Cargo.lock` are still absent from the branch.

Do not hand-write dependency integrity/lock metadata.

Once both files actually land:

1. restore `lockfiles.yml` to `workflow_dispatch` only;
2. review generated dependency changes;
3. switch applicable CI/security/release/Makefile/setup commands to `npm ci --ignore-scripts` and Cargo `--locked`;
4. enable npm dependency caching where the committed lock supports it;
5. run/review the exact-candidate quality/security matrix.

## 29. Security automation

Current source-controlled security automation includes:

- CodeQL JavaScript/TypeScript analysis;
- Gitleaks repository secret scan with full history checkout;
- RustSec dependency audit;
- npm audit at high severity or greater;
- Dependabot configuration.

The security workflow remains compatible with the current missing-lockfile state by generating audit lockfiles locally for dependency audit jobs.

Once committed lockfiles exist, convert the audit jobs to consume the committed graph rather than generating a fresh dependency graph.

## 30. CI improvements

Current PR CI source includes:

### Metadata job

- version consistency;
- Tauri frontend configuration;
- internal Markdown links.

### Rust job

- `cargo fmt --all -- --check`;
- canonical Rust tests;
- Clippy for core + WASM bridge with warnings denied.

### Web job

- dependency install;
- WASM build;
- TypeScript project check;
- ESLint;
- Vitest coverage;
- production PWA build;
- production asset budget.

### E2E job

- Chromium installation;
- production/WASM-backed Playwright suite including axe and offline/persistence journeys.

Concurrency groups cancel superseded PR runs created from the current workflow definitions.

Current CI still uses floating npm resolution/non-locked Cargo because the repository lockfiles are not present. Do not switch to locked commands until those files actually exist.

## 31. Tagged web release workflow hardened

A pushed `vX.Y.Z` tag currently gates publication on:

1. manifest version consistency;
2. Tauri frontend configuration;
3. internal Markdown link integrity;
4. exact tag/package version match;
5. dependency installation;
6. Rust formatting;
7. canonical Rust tests;
8. Rust Clippy;
9. web TypeScript checking;
10. web ESLint;
11. Vitest coverage;
12. real WASM-backed production PWA build;
13. production web asset budget;
14. Chromium installation;
15. Playwright E2E/axe suite;
16. compressed web artifact creation;
17. SHA-256 checksum generation;
18. GitHub release creation/update with generated release notes and archive/checksum files.

This is source configuration, not proof that a `v0.2.0` release ran.

No stable tag has been created.

## 32. Release evidence document

Added:

`docs/release-evidence.md`

It defines exact-candidate evidence for:

- candidate SHA/version;
- version/config/docs checks;
- Rust quality;
- web quality;
- asset budget;
- browser E2E/axe;
- CodeQL;
- secret scanning;
- dependency audits;
- screenshots;
- Linux/Windows/macOS native bundles;
- offline/install/update behavior;
- branding assets;
- tagged web archive/checksum.

The template explicitly keeps rows `Pending` until evidence exists for the exact candidate SHA.

## 33. GitHub repository settings guidance

Added:

`docs/repository-settings.md`

It documents recommended:

- `main` branch protection/ruleset behavior;
- required-check selection policy;
- merge policy;
- GitHub Discussions categories;
- labels;
- milestones;
- Dependabot/security settings;
- private vulnerability reporting;
- release settings.

The connected GitHub toolset in this continuation did not expose branch-protection/ruleset mutation APIs, so documentation does not claim those account-level settings were configured.

## 34. Pull request/contribution guidance strengthened

Updated:

- `.github/PULL_REQUEST_TEMPLATE.md`;
- `CONTRIBUTING.md`.

The review checklist now covers:

- version/config/docs checks;
- Rust/web tests;
- production asset budget;
- E2E/accessibility;
- untrusted-input validation;
- persistence/backup migrations;
- logging/privacy;
- dependency/CSP/permission impact;
- keyboard/focus/reduced-motion/contrast concerns;
- real screenshots;
- release evidence.

## 35. Makefile aligned with v0.2 quality concepts

The root Makefile now exposes coherent targets for:

- `metadata`;
- `wasm`;
- `web`;
- `budget`;
- `test`;
- `lint`;
- `e2e`;
- `screenshots`;
- `desktop-check`;
- `check`.

Locked dependency commands are intentionally deferred until lockfiles exist.

## 36. Documentation synchronized in this continuation

Updated/added documentation includes:

- `README.md`;
- `PRIVACY.md`;
- `SECURITY.md` from prior v0.2 security hardening;
- `CHANGELOG.md`;
- `ROADMAP.md`;
- `CONTRIBUTING.md`;
- `.github/PULL_REQUEST_TEMPLATE.md`;
- `docs/setup.md`;
- `docs/development.md`;
- `docs/testing.md`;
- `docs/performance.md`;
- `docs/release.md`;
- `docs/release-evidence.md`;
- `docs/repository-settings.md`;
- `docs/architecture.md`;
- `docs/accessibility.md` from earlier v0.2 work;
- `docs/dependency-lockfiles.md`;
- `docs/adr/0004-versioned-local-backups.md`;
- `docs/adr/0005-externalized-product-copy.md`;
- this `what_changed.md`.

The public README now explicitly states that:

- source version 0.2.0 is not a stable release claim;
- lockfiles are absent;
- generated screenshots are absent;
- generated desktop icons are absent;
- native target workflow definitions are not platform-success claims.

---

# Current hosted verification state

For pre-handoff head:

`aabcca99c66ba296e36452e400fe2af6f1fe2f21`

GitHub reported PR workflow runs:

- **CI** — run `32218214496` — `queued`;
- **CodeQL** — run `32218214490` — `pending`;
- **Dependency Security** — run `32218214470` — `queued`.

No conclusion is available for those exact runs yet.

Do not write “green CI” or “security passed” until the current candidate’s workflows complete successfully.

The branch has been pushed many times with atomic commits, so older queued/superseded runs are not suitable release evidence for a newer candidate.

---

# Generated artifact state at pre-handoff checkpoint

Explicit GitHub file checks returned **Not Found** for:

- `package-lock.json`;
- `Cargo.lock`;
- `apps/desktop/src-tauri/icons/icon.ico`;
- `docs/screenshots/converter-desktop.png`.

Therefore:

- npm locked installation is not currently available from the branch;
- Cargo locked verification is not currently available from the branch;
- desktop generated icon completion is not currently available;
- committed verified screenshot completion is not currently available.

The workflows/tooling to generate and validate these items are implemented, but the artifacts themselves remain release gates.

---

# Source audit performed in this continuation

GitHub code search did not surface current indexed occurrences of:

- `TODO`;
- `FIXME`;
- `HACK`;
- stale `0.1.0` source references;
- placeholder markers.

This does not replace compilation/tests, but it closes the source-level unfinished-marker/stale-version audit for this checkpoint.

The branch also remains 0 commits behind `main` at the pre-handoff compare snapshot.

---

# Verification that was actually performed vs. not performed

## Actually verified through current GitHub state

- PR #11 exists, is open, non-draft, mergeable, and not merged.
- Exact base/merge-base is `648662788597dcfbbc0db7eb9021f1863c764fb5`.
- Pre-handoff branch head is `aabcca99c66ba296e36452e400fe2af6f1fe2f21`.
- Pre-handoff compare is 164 commits ahead / 0 behind.
- Pre-handoff diff is 78 changed files, 4454 additions, 438 deletions.
- Current PR workflow statuses are queued/pending as recorded above.
- Lockfiles are absent.
- Generated Tauri icon evidence is absent.
- Generated screenshot evidence is absent.
- No stable tag/release is claimed.
- Repository source contains the implementation/tests/workflows/docs described above.
- The PR description has been corrected to match those facts.

## Secondary local-environment observations

A local `/mnt/data/thermoshift_build` directory exists but is an old/incomplete snapshot (for example, it contains 0.1.0 package metadata and is missing files that exist in GitHub). It was therefore **not** used as the source of truth for current branch completion.

An offline npm lockfile attempt from that stale copy failed because the local npm cache lacked `@tauri-apps/cli` metadata.

A direct registry probe also did not provide a usable current dependency-resolution path in this environment.

Therefore no lockfile has been fabricated from incomplete/stale/cached information.

## Explicitly not claimed as passed for the current head

Until hosted/full toolchain evidence completes, do not claim current-head success for:

- npm dependency resolution;
- Rust compilation;
- Rust formatting;
- Rust tests;
- Rust Clippy;
- WASM build;
- TypeScript project typecheck;
- ESLint;
- Vitest coverage thresholds;
- production PWA build;
- production asset budget measurement;
- current Playwright E2E/axe suite;
- current CodeQL;
- current Gitleaks;
- current RustSec audit;
- current npm audit;
- current native Linux package build;
- current native Windows package build;
- current native macOS package build;
- signed/notarized package creation;
- screenshot generation/validation;
- icon generation/validation;
- tagged release archive/checksum.

The source has been hardened extensively, but exact-candidate verification evidence is still a separate release requirement.

---

# Important continuation commits added in the current work sequence

The following are meaningful atomic commits added while continuing v0.2. GitHub history remains the authoritative source for full ordering/metadata.

## Screenshot/release evidence automation

- `9cae5817e85cd72d2268e4b3cd8bc1fb22715e38` — `test(screenshots): add dedicated Playwright capture config`
- `adbff97b534e3c287b4720d1c424e45de4abd81f` — `test(screenshots): capture verified product surfaces`
- `2219d1933657b0ba20f5bd183ef5cd38d768f15e` — `build(screenshots): add verified capture command`
- `16e8e76896476250123983c0d9016ebb7b811b48` — `ci: add verified screenshot capture workflow`
- `6a46077f415efef60e9e8dcccd35e62bceaa3549` — `build(screenshots): validate captured product images`
- `04da6251af6f4b0f348cff67d6c86111f2741c5b` — `build(screenshots): expose screenshot evidence check`
- `b30dba829ab1b2168a6e573ef4b0b6129f760d61` — `ci(screenshots): enforce image integrity checks`
- `f393fcf5aa54a2d66707e97e34728d92636ab2ad` — `ci(screenshots): preserve verified capture evidence`

## Lockfile/native-platform/icon automation

- `02444fd16bdec6346f00ac5b0bc3ba81ba0dd64f` — `ci: trigger hosted lockfile refresh`
- `97796437f7031cfd4bc8a2567e93c4c853146064` — `ci(desktop): add cross-platform package verification`
- `f2574f38d74ff18bca5258dfc8839d0c06e8f0a3` — `build(desktop): add reproducible icon generation`
- `e8e37b287c75d0d8aa7d4db0717aa98a9435bd4c` — `ci(desktop): add hosted icon generation workflow`
- `3ab6fd9ebc37f991cedeb055a0035fbe13e36227` — `ci(lockfiles): preserve generated dependency evidence`
- `29d1c63d97ad2db3439cb3326e9dc428eec53502` — `ci(desktop): preserve generated icon evidence`

## CI/security/docs/release gates

- `adc305ff706b462e66d952788f3b46dd979f90fc` — `ci: enforce desktop frontend configuration`
- `540dea3da977d0072951e9a1a7e57c50ab762f1e` — `build(docs): add internal Markdown link checker`
- `1dc13acaddfac688ec48481d5e7151f80fe7ba2d` — `build(docs): expose documentation link check`
- `cc18e87520879768a23a91894e81e0e4f3505869` — `ci(docs): fail on broken internal links`
- `5f8d40c9800e9da359682db70f29f83c00455cec` — `ci(security): add repository secret scanning`
- `0824305b0fbee9f9a3e05f4a2ebbfb523f144c80` — `build: align Makefile with v0.2 quality gates`
- `77616c12738d9637e2aed87003c13509cd61cbb0` — `docs(performance): document enforced production budgets`
- `e985e69d4f1e7fd01e73acab0d2ca2a562c8dfd3` — `ci(release): enforce full web quality gate`
- `22a2a26d08c75539368d8e9146c25a3978f3ec60` — `docs(github): define repository settings baseline`
- `0be29c4ef75cae7adea527b63b5daedc98758410` — `docs(release): define release evidence record`
- `482feb5468053c24c579233f2985cb5874884d2a` — `docs(release): align process with current quality gates`
- `688bcb889e0daacb716f5a9098efa5a26577c036` — `docs(setup): document current v0.2 toolchain`
- `7c92e8146f75df88ef2f994cd7434856538941e6` — `docs(development): document v0.2 engineering workflow`
- `01ab49de7cdda94772a7a626e8e9e4617ed65838` — `docs(testing): document phase six verification layers`

## E2E/reliability hardening

- `e5d3d525d77455097a42d10ecfe0047233dd4c40` — `test(e2e): cover offline persistence and settings`
- `7a5f298df0a3ae2a731a0ca615a05e544027577d` — `feat(storage): add strict settings validator`
- `40a34c492708a468be3dce9f3619ae79c8ddfb33` — `test(storage): cover strict settings validation`
- `c748d5a88df57a490738d4ed6a9231d50a552d72` — `fix(backup): reject malformed restore metadata`
- `567f5e8cd3d1e7861fa2814cd62b38080a917c6a` — `test(backup): cover strict restore metadata`
- `f8c703d120447a4e54ccbb072e159b6cc65f85d8` — `test(settings): reject malformed backup metadata`
- `7176416f5d4086ec63dd1f0f5bf02bee86d83c42` — `fix(core): normalize Unicode unit names`
- `e41210c3878477e3bfb2b7b9ea83a1c695a794d0` — `test(core): cover unit parser aliases and Unicode case`

## User-safe failure/accessibility hardening

- `3e45d98d5db38ccf519568a55f33e23617d75203` — `fix(pwa): keep update errors user-safe`
- `d346d322bc6ac1699a938a50c46391ce092a0407` — `fix(settings): show generic update failure message`
- `abd2f37742d325d876d778141973dfa2691ef105` — `test(pwa): verify update errors stay generic`
- `7f3975b4944386ed16caf566e5c7b890c403da42` — `test(settings): keep update failure copy user-safe`
- `eff62934d658ec23e06604ebdbf325e3b6b3f190` — `fix(accessibility): avoid page shortcuts in editors`
- `70cc28807ca1e2f239513ec8defbdbcc533d1d7e` — `test(accessibility): preserve editing during Alt shortcuts`
- `81e58e23fab2ac30c7ff56823acfde6970d9d09f` — `fix(accessibility): keep global shortcuts out of modals`
- `2f9fdcf256dd3fb3b72476d1b220479825ee53e5` — `test(accessibility): keep modal interactions exclusive`
- `11dbc416e156cf3fd12fae93d66b0e57c3f47cb4` — `fix(app): keep startup failures user-safe`
- `10415f85a7b0f71a6167addc165567df0882fd2f` — `test(app): hide raw startup failure detail`

## Evidence/documentation synchronization

- `97a126a286cc61cba8fcdc9b01c239d98f65212b` — `chore(github): strengthen pull request quality checklist`
- `d2e180624e9d29d827dcd5477286e743f63580c2` — `docs(contributing): align contributor quality gate`
- `e468717ecfe6f41b8e84990bae424019aa6b862a` — `docs(changelog): record v0.2 release-hardening work`
- `7244c4c2b652c11cd1ee6bc20e5fb17f4d374ce2` — `docs(roadmap): align v0.2 completion and release gates`
- `941c92dfee758287e8f7f7d13c4ab1f8002aa975` — `docs(readme): align public v0.2 project state`
- `7522c0700d1257b0a609c9a4c39fa0a259bb36a3` — `docs(privacy): document strict restore and local diagnostics`
- `9a03ccf240f179f9fcbb0a3b7990f9a12ad3c24c` — `docs(architecture): record hardened v0.2 boundaries`
- `aabcca99c66ba296e36452e400fe2af6f1fe2f21` — `docs(adr): harden strict backup restore contract`

Earlier v0.2 commits remain part of this branch and include onboarding, Quick Actions, history, backup, references, localization, focus management, persistence, logging, update controls, budget/version/config scripts, and the broader documentation/test foundation.

---

# Exact changed-file scope at pre-handoff compare

GitHub reported **78 changed files** relative to `main`.

The change set spans:

## GitHub/repository automation

- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/desktop-platforms.yml`
- `.github/workflows/icons.yml`
- `.github/workflows/lockfiles.yml`
- `.github/workflows/release.yml`
- `.github/workflows/screenshots.yml`
- `.github/workflows/security.yml`

## Root project/docs/build files

- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `Makefile`
- `PRIVACY.md`
- `README.md`
- `ROADMAP.md`
- `SECURITY.md`
- `package.json`
- `what_changed.md`

## Desktop

- `apps/desktop/package.json`
- `apps/desktop/src-tauri/Cargo.toml`
- `apps/desktop/src-tauri/tauri.conf.json`

## Web application/tests

- `apps/web/e2e/smoke.spec.ts`
- `apps/web/package.json`
- `apps/web/screenshot.config.ts`
- `apps/web/screenshots/capture.spec.ts`
- `apps/web/src/App.test.tsx`
- `apps/web/src/App.tsx`
- `apps/web/src/components/AboutPanel.tsx`
- `apps/web/src/components/BatchConverter.tsx`
- `apps/web/src/components/ConverterPanel.tsx`
- `apps/web/src/components/FormulaPanel.tsx`
- `apps/web/src/components/HistoryPanel.tsx`
- `apps/web/src/components/OnboardingDialog.tsx`
- `apps/web/src/components/ProjectLinks.tsx`
- `apps/web/src/components/QuickActions.tsx`
- `apps/web/src/components/ReferenceCards.tsx`
- `apps/web/src/components/SettingsPanel.tsx`
- `apps/web/src/components/UpdatePanel.test.tsx`
- `apps/web/src/components/UpdatePanel.tsx`
- `apps/web/src/components/components.test.tsx`
- `apps/web/src/components/interactions.test.tsx`
- `apps/web/src/enhancements.css`
- `apps/web/src/hooks/useDialogFocusTrap.ts`
- removed `apps/web/src/hooks/usePersistentState.ts`
- `apps/web/src/i18n/en.ts`
- `apps/web/src/lib/backup.test.ts`
- `apps/web/src/lib/backup.ts`
- `apps/web/src/lib/export.test.ts`
- `apps/web/src/lib/logger.test.ts`
- `apps/web/src/lib/logger.ts`
- `apps/web/src/lib/pwaUpdate.test.ts`
- `apps/web/src/lib/pwaUpdate.ts`
- `apps/web/src/lib/storage.test.ts`
- `apps/web/src/lib/storage.ts`
- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`
- `apps/web/src/test/setup.ts`

## Rust

- `crates/thermoshift-core/Cargo.toml`
- `crates/thermoshift-core/src/temperature.rs`
- `crates/thermoshift-core/src/unit.rs`
- `crates/thermoshift-wasm/Cargo.toml`

## Documentation/ADRs

- `docs/accessibility.md`
- `docs/adr/0004-versioned-local-backups.md`
- `docs/adr/0005-externalized-product-copy.md`
- `docs/architecture.md`
- `docs/dependency-lockfiles.md`
- `docs/development.md`
- `docs/performance.md`
- `docs/release-evidence.md`
- `docs/release.md`
- `docs/repository-settings.md`
- `docs/setup.md`
- `docs/testing.md`

## Verification scripts

- `scripts/check-desktop-config.mjs`
- `scripts/check-doc-links.mjs`
- `scripts/check-screenshot-set.mjs`
- `scripts/check-versions.mjs`
- `scripts/check-web-budget.mjs`

GitHub compare is the authoritative source if later commits add/remove files after this checkpoint.

---

# Known release blockers / incomplete evidence

1. **Dependency lockfiles are missing.**
   - `package-lock.json`: absent.
   - `Cargo.lock`: absent.
   - Do not fabricate them.

2. **Hosted generator execution evidence is not available yet.**
   - Lockfile and icon workflows were source-triggered, but generated commits/files have not appeared at this checkpoint.

3. **Generated desktop icons are missing.**
   - `apps/desktop/src-tauri/icons/` completion is not claimed.

4. **Verified product screenshots are missing.**
   - Capture/validation code exists; PNG evidence has not landed.

5. **Current PR CI is not completed.**
   - CI queued.
   - CodeQL pending.
   - Dependency Security queued.

6. **Unsigned native platform bundle evidence remains incomplete.**
   - The cross-platform matrix exists.
   - Exact-candidate Linux/Windows/macOS successful bundle results are not claimed.

7. **Signing/notarization remains unconfigured.**
   - Owner-controlled credentials must never be committed.

8. **Repository administration settings remain external.**
   - Branch protection/rulesets and Discussions cannot be claimed configured from this connector session because a mutation tool was not exposed.

9. **No stable v0.2.0 release has been tagged.**
   - This is intentional until exact-candidate evidence is complete.

---

# Next exact tasks — continue in this order

## Task 1 — inspect generated lockfile output

Check GitHub branch for:

- `package-lock.json`;
- `Cargo.lock`.

If both exist:

1. inspect/review their generated changes;
2. restore `.github/workflows/lockfiles.yml` to `workflow_dispatch` only (remove branch push trigger);
3. update CI web/E2E dependency installation to `npm ci --ignore-scripts`;
4. add npm cache configuration backed by `package-lock.json`;
5. update Rust reproducibility-sensitive commands to `--locked` where appropriate;
6. update security audits to consume committed locks;
7. update release workflow to `npm ci` / locked Cargo;
8. update Makefile/setup/development/README lockfile wording;
9. run/review current exact-head CI/security evidence.

If lockfiles still do not exist, keep the blocker open and do not hand-author integrity metadata.

## Task 2 — inspect generated desktop icon output

Check:

`apps/desktop/src-tauri/icons/`

Required primary outputs include:

- `32x32.png`;
- `128x128.png`;
- `128x128@2x.png`;
- `icon.icns`;
- `icon.ico`.

If generated files exist:

1. restore `.github/workflows/icons.yml` to manual-only `workflow_dispatch`;
2. verify Tauri bundle icon config references the intended assets if explicit icon paths are required;
3. extend `check-desktop-config.mjs` to fail when required generated icon files/config drift;
4. update release evidence/README state.

## Task 3 — run verified screenshots after locked npm graph is available

The screenshot workflow currently expects `npm ci`, therefore it should be run after `package-lock.json` actually lands.

Then:

1. run `Verified Product Screenshots` for the exact candidate;
2. verify the eight-image set;
3. review actual product appearance/content;
4. commit only validated real captures;
5. update README screenshot presentation with actual files;
6. keep screenshot artifact evidence/release record.

## Task 4 — inspect current PR hosted checks

For the newest PR head, inspect:

- CI metadata;
- Rust job;
- web job;
- E2E job;
- CodeQL;
- Gitleaks;
- RustSec;
- npm audit.

Fix actual failures atomically with regression tests where relevant.

Do not spend commits on hypothetical errors before a job surfaces one unless a source audit independently proves a defect.

## Task 5 — run unsigned desktop platform matrix

After lockfiles exist, run/review:

- Ubuntu/Linux native bundle;
- Windows native bundle;
- macOS native bundle.

Download/review the workflow artifacts and record exact run IDs/results in `docs/release-evidence.md` / this handoff.

## Task 6 — real-device/browser PWA evidence

For the intended release matrix, verify:

- installation;
- offline launch;
- cached conversion;
- service-worker update behavior;
- local persistence;
- backup/export behavior;
- keyboard/touch behavior;
- zoom/contrast/reduced motion.

## Task 7 — repository settings

Configure through GitHub settings/API when available:

- `main` branch protection/ruleset;
- exact required current check names;
- conversation resolution;
- no force pushes;
- optional Discussions categories;
- labels/milestones;
- private vulnerability reporting/security features where supported.

Use `docs/repository-settings.md` rather than guessing required check names before they exist.

## Task 8 — merge v0.2 only after evidence

If exact candidate checks/evidence are acceptable:

- merge PR #11 with a merge commit rather than squashing the meaningful history;
- confirm final `main` SHA;
- update `what_changed.md` on `main` with PR merge SHA/check evidence;
- re-run any required post-merge `main` checks.

## Task 9 — tag/release only after the documented gate

Only then:

- create annotated `v0.2.0` tag;
- verify release workflow passes;
- download release archive;
- validate SHA-256 checksum;
- review generated release notes;
- attach/publish native artifacts only after appropriate platform signing/notarization evidence.

---

# Migration notes

There is no remote/database migration.

Local browser keys remain:

- `thermoshift.settings.v1`;
- `thermoshift.history.v1`;
- `thermoshift.onboarding.v1`.

Full backup schema remains:

- `schemaVersion: 1`.

The schema number did not change during the stricter validation update because valid v1 backups remain valid; malformed/corrupt data that never satisfied the intended contract is now rejected instead of silently repaired.

Future backup/local-storage schema changes must add explicit compatibility/migration behavior and tests.

---

# Release notes draft

ThermoShift 0.2.0 extends the canonical Rust/WebAssembly local-first temperature converter with accessible first-run onboarding, keyboard Quick Actions, searchable/filterable history with delete/undo, strict versioned full backup/restore, selectable educational reference scales, expanded formula derivations, centralized English product copy, PWA update controls, local redacted structured diagnostics, Unicode-aware accented unit parsing, safer modal/global keyboard ownership, generic operational failure UI, stronger persistence/import boundaries, dense Rust invariants, broader unit/component/E2E/accessibility coverage, offline service-worker conversion tests, repository version/Tauri/docs-link checks, production bundle budgets, CodeQL/Gitleaks/dependency security automation, verified-product screenshot tooling, reproducible desktop icon generation tooling, unsigned Windows/macOS/Linux verification automation, exact-candidate release-evidence documentation, and a hardened tagged web release/checksum gate.

This is still a **release-candidate implementation**, not a stable-release claim. Missing dependency lockfiles, generated desktop icons/screenshots, current hosted check conclusions, exact native-platform bundle evidence, and signing/notarization remain explicit gates.

---

# Continuation rule

1. Read this file first.
2. Inspect current PR #11 head and compare state.
3. Check whether lockfiles/icons/screenshots have actually landed before changing any “pending” statement.
4. Inspect the newest current-head workflow results, not superseded older runs.
5. Do not repeat completed product features unless a real regression/failing check demonstrates the need.
6. Keep executable temperature formulas in Rust.
7. Preserve strict external-backup validation vs forgiving local-storage recovery.
8. Keep raw operational error details out of user-facing startup/update UI.
9. Do not manufacture generated evidence.
10. Keep changes atomic/meaningful and update this file again at the next real milestone.

GitHub history, current repository files, current PR metadata, and current workflow results are the source of truth for exact hashes, file presence, merge status, and release evidence.
