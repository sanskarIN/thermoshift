# ThermoShift

<p align="center">
  <img src="apps/web/public/logo.svg" width="112" alt="ThermoShift logo" />
</p>

<p align="center"><strong>Precise, private, offline-first temperature conversion powered by Rust.</strong></p>

<p align="center">
  <a href="https://github.com/sanskarIN/thermoshift/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/sanskarIN/thermoshift/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="https://buymeacoffee.com/sanskarIN"><img alt="Buy Me a Coffee" src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000" /></a>
</p>

ThermoShift is a production-oriented temperature converter for Web/PWA with a Tauri desktop target for Windows, macOS, and Linux. Its conversion rules live in one Rust domain engine exposed to the browser through WebAssembly. Core conversion needs no account, server, analytics service, or network request.

> **Release status:** source metadata is currently `0.2.0`, but the v0.2 release candidate remains untagged while exact-candidate hosted checks and generated cross-platform release evidence are completed. See [`ROADMAP.md`](ROADMAP.md) and [`docs/release-evidence.md`](docs/release-evidence.md).

## Highlights

- Celsius, Fahrenheit, Kelvin, Rankine, Réaumur, Delisle, Newton, and Rømer.
- Absolute-zero validation and rejection of non-finite values in the canonical Rust engine.
- Unicode-aware unit-name/alias parsing, including accented Réaumur and Rømer forms.
- Instant bidirectional conversion with configurable precision and rounding.
- First-run onboarding explaining local-first privacy and offline use without an account.
- Reference cards switchable across all supported scales.
- Batch conversion with CSV export and per-line validation.
- Local conversion history with search, from/to filters, individual deletion, clear, and undo.
- Versioned full-data JSON backup with strict all-or-nothing restore validation and a 256 KiB import limit.
- Formula guide with educational derivation notes while executable formulas remain in Rust.
- Offline-capable installable PWA with explicit update checks in Settings.
- Light, dark, system, high-contrast, reduced-motion, keyboard navigation, responsive layouts, and modal focus containment.
- Quick Actions command palette with `Ctrl/⌘+K` plus `Alt+1` through `Alt+6` page shortcuts outside editable/modal interactions.
- Copy/share support without a server.
- English UI copy externalized into a locale module for future language expansion.
- Local-only structured diagnostics with secret/PII-shaped metadata redaction and generic user-facing operational errors.
- Static version/Tauri configuration/documentation-link checks, Rust/web quality gates, Playwright/axe coverage, and production asset budgets.
- CodeQL, Gitleaks, RustSec/npm dependency auditing, Dependabot, and release checksum automation.
- Dedicated workflows for real product screenshots, generated desktop icons, dependency lockfiles, and unsigned Windows/macOS/Linux native build evidence.
- Open-source MIT license and no required account.

## Screenshots

ThermoShift includes a real-product screenshot capture/validation pipeline, but verified PNG captures are not committed yet on the current v0.2 branch. No mockup or placeholder is presented here as a real product screenshot.

Once the generated evidence exists, captures are expected under `docs/screenshots/` and validated with:

```bash
npm --workspace @thermoshift/web run screenshots
npm run check:screenshots
```

## Platform targets

| Platform | Delivery | Current repository status |
|---|---|---|
| Modern Chromium-class browsers | React + WebAssembly | Primary development/E2E target |
| Installable PWA | Vite PWA / service worker | Implemented; release evidence still reviewed per candidate |
| Windows | Tauri 2 | Configured target; exact native package evidence pending |
| macOS | Tauri 2 | Configured target; exact native package evidence pending |
| Linux | Tauri 2 | Configured target; exact native package evidence pending |

A workflow definition is not a claim that every platform build passed. See the release-evidence record for the exact candidate.

## Tech stack

- Rust for canonical temperature domain logic.
- `wasm-bindgen` / `wasm-pack` for the browser bridge.
- React + TypeScript + Vite for the PWA.
- Tauri 2 for native desktop packaging.
- Vitest, Testing Library, Playwright, and axe for automated quality/accessibility checks.
- GitHub Actions, CodeQL, Gitleaks, dependency audits, Dependabot, and release automation.

## Quick start

Prerequisites: current stable Rust, Node.js 22+, npm, `wasm32-unknown-unknown`, and `wasm-pack`.

```bash
git clone https://github.com/sanskarIN/thermoshift.git
cd thermoshift
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --locked
npm install --ignore-scripts
npm run dev
```

The current v0.2 branch does **not** yet contain committed npm/Cargo lockfiles, so documentation does not claim a locked install. A native-tool generation workflow exists; when `package-lock.json` and `Cargo.lock` actually land in the candidate, reproducibility-sensitive commands will switch to `npm ci` and Cargo `--locked`.

Open the Vite URL (normally `http://localhost:5173`). On first run, choose **Start converting** or **Review settings first**.

## Keyboard workflow

- `Ctrl+K` on Windows/Linux or `⌘+K` on macOS opens Quick Actions after onboarding.
- `Alt+1` through `Alt+6` opens Converter, Batch, History, Formulas, Settings, and About when focus is not in an editable control and no modal owns interaction.
- `Tab`/`Shift+Tab` navigation works throughout the app; modal dialogs contain focus until they close.
- A skip link is available for keyboard navigation to main content.

## Local data and backup

ThermoShift keeps settings, onboarding state, and explicitly saved conversions in browser-managed local storage.

Settings can export a versioned JSON backup containing settings and saved history. Restore checks file size before reading, then validates schema version, export timestamp, the complete settings shape, history length, every conversion record, and duplicate IDs before replacing application state. Invalid input is rejected rather than partially imported or silently normalized.

History export remains available separately from the History page. Full backup files are ordinary local files under the user's control and are not uploaded by ThermoShift.

## PWA update behavior

Settings displays the installed engine/application version and exposes an explicit **Check for updates** action backed by the service-worker registration. Offline conversion does not depend on update availability.

Operational update failures are logged only through the redacted local diagnostic boundary; raw browser error messages are not echoed into Settings.

## Development and quality commands

See [`docs/setup.md`](docs/setup.md) and [`docs/development.md`](docs/development.md) for the full workflow.

```bash
npm run check:versions
npm run check:desktop-config
npm run check:docs
cargo fmt --all -- --check
cargo test -p thermoshift-core
cargo clippy -p thermoshift-core -p thermoshift-wasm --all-targets -- -D warnings
npm --workspace @thermoshift/web run typecheck
npm --workspace @thermoshift/web run lint
npm --workspace @thermoshift/web run test
npm --workspace @thermoshift/web run build
npm run check:web-budget
npm --workspace @thermoshift/web run e2e
```

The browser suite covers real WASM conversion, first-run behavior, keyboard navigation, local-history persistence, service-worker-controlled offline reload/conversion, Settings/update UI, and axe scans at configured desktop/mobile form factors.

## Performance budget

After a production build, `npm run check:web-budget` enforces:

- total measured runtime assets ≤ 2 MiB raw;
- total measured runtime assets ≤ 750 KiB gzip;
- any JavaScript asset ≤ 750 KiB raw;
- any WebAssembly asset ≤ 512 KiB raw.

Source maps are excluded from runtime transfer budgets. See [`docs/performance.md`](docs/performance.md).

## Desktop development

On a machine with the current Tauri prerequisites:

```bash
npm run check:desktop-config
cargo check -p thermoshift-desktop
npm run desktop:dev
npm run desktop:build
```

The manual `Desktop Platform Verification` workflow defines unsigned Linux/Windows/macOS package jobs and uploads native bundle evidence. Signing/notarization remains a separate owner-controlled release gate.

Generate Tauri platform icons from the editable SVG logo with:

```bash
npm --workspace @thermoshift/desktop run icons
```

Generated desktop icons are not claimed complete until `apps/desktop/src-tauri/icons/` actually exists in the candidate.

## Architecture

`thermoshift-core` is the executable source of truth for conversion and physical validation. The React application calls it through a generated WebAssembly bridge, and Tauri links the same Rust core. This avoids parallel formula implementations drifting apart.

Presentation state is local-first. Browser data is versioned; backup parsing is strict; English product copy is externalized under `apps/web/src/i18n/`; reusable accessibility behavior lives outside individual screens; and local diagnostics sanitize metadata before console serialization.

See [`docs/architecture.md`](docs/architecture.md) and [`docs/adr/`](docs/adr/).

## Security and privacy

ThermoShift performs conversions locally. It has no required backend, account, analytics pipeline, or secret API key. The PWA service worker caches application assets for offline use/update behavior; history, settings, and onboarding state use browser local storage. Export/restore occur only after explicit user action.

Repository automation includes CodeQL, Gitleaks, RustSec/npm audits, and secret-safe release practices. See [`PRIVACY.md`](PRIVACY.md) and [`SECURITY.md`](SECURITY.md).

## Release process

A `vX.Y.Z` tag triggers the web release workflow, which validates version/tag consistency, repository config/docs, Rust quality, web type/lint/coverage, production PWA build/budget, Playwright E2E/axe, and then produces a compressed web artifact plus SHA-256 checksum.

Do not create `v0.2.0` merely because source metadata is 0.2.0. Follow [`docs/release.md`](docs/release.md) and record exact-candidate evidence in [`docs/release-evidence.md`](docs/release-evidence.md).

Recommended GitHub repository settings are documented in [`docs/repository-settings.md`](docs/repository-settings.md).

## Contributing

Issues and pull requests are welcome. Read [`CONTRIBUTING.md`](CONTRIBUTING.md), follow [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and include regression tests for behavior changes.

## License

MIT — see [`LICENSE`](LICENSE).

## Contact and support

- Business: `sanskarin@outlook.in`
- Business: `sanskarin.business@gmail.com`
- Support: `supportramsandesh@gmail.com`
- GitHub: <https://github.com/sanskarIN>
- Repository: <https://github.com/sanskarIN/thermoshift>

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/sanskarIN)

**Made by the Sanskar**
