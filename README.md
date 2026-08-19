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

ThermoShift is a production-oriented temperature converter for Web/PWA and Windows, macOS, and Linux through Tauri. Its conversion rules live in one Rust domain engine, exposed to the browser through WebAssembly. Core conversion needs no account, server, analytics service, or network connection.

## Highlights

- Celsius, Fahrenheit, Kelvin, Rankine, Réaumur, Delisle, Newton, and Rømer.
- Validates every input against absolute zero and rejects non-finite values.
- Instant bidirectional conversion with configurable precision and rounding.
- First-run onboarding that explains local-first privacy and offline use without blocking core functionality.
- Reference cards switchable across all supported scales.
- Batch conversion with CSV export and per-line validation.
- Local conversion history with search, from/to filters, individual deletion, clear, and undo.
- Versioned full-data JSON backup and validated restore for settings plus saved history.
- Formula guide with educational derivation notes.
- Offline installable PWA.
- Light, dark, system, high-contrast, reduced-motion, keyboard navigation, and responsive layouts.
- Quick Actions command palette with `Ctrl/⌘+K` plus direct `Alt+1` through `Alt+6` page shortcuts.
- Dialog focus containment and visible keyboard focus behavior.
- Copy/share support without a server.
- English UI copy externalized into a locale module so additional languages can be added without mixing translations into domain logic.
- Open-source MIT license and no required account.

## Screenshots

Real release screenshots are captured as part of the release checklist. Until the first packaged release, run the app locally using the quick start below. Screenshot placeholders are intentionally not presented as real product captures.

## Supported platforms

| Platform | Delivery | Status |
|---|---|---|
| Modern browsers | React + WebAssembly | Primary |
| Installable PWA | Vite PWA | Primary |
| Windows | Tauri 2 | Supported target |
| macOS | Tauri 2 | Supported target |
| Linux | Tauri 2 | Supported target |

## Tech stack

- Rust for canonical temperature domain logic.
- `wasm-bindgen`/`wasm-pack` for the web bridge.
- React + TypeScript + Vite for the PWA.
- Tauri 2 for native desktop packaging.
- Vitest, Testing Library, Playwright, and axe for automated quality checks.
- GitHub Actions, CodeQL, dependency audits, and Dependabot for repository automation.

## Quick start

Prerequisites: current stable Rust, Node.js 22+, npm, and `wasm-pack`.

```bash
git clone https://github.com/sanskarIN/thermoshift.git
cd thermoshift
npm install
cargo install wasm-pack --locked
npm run dev
```

Then open the URL shown by Vite (normally `http://localhost:5173`). On the first run, ThermoShift shows a short local-first onboarding dialog. Choose **Start converting** to go directly to the converter or **Review settings first** to open preferences.

## Keyboard workflow

- `Ctrl+K` on Windows/Linux or `⌘+K` on macOS opens Quick Actions.
- `Alt+1` through `Alt+6` opens Converter, Batch, History, Formulas, Settings, and About respectively.
- Standard `Tab`/`Shift+Tab` navigation works throughout the app; modal dialogs keep keyboard focus contained until they close.

## Local data and backup

ThermoShift keeps settings, onboarding state, and explicitly saved conversions in browser-managed local storage. The Settings page can export a versioned JSON backup containing settings and saved history. Restore validates the schema and every history record before replacing the current in-memory state; invalid backups are rejected rather than partially imported.

History export remains available separately from the History page. Full backup files are ordinary local files under the user's control and are not uploaded by ThermoShift.

## Development setup

See [`docs/setup.md`](docs/setup.md) for platform prerequisites and [`docs/development.md`](docs/development.md) for architecture-aware development workflows.

Useful commands:

```bash
cargo test -p thermoshift-core
cargo fmt --all -- --check
cargo clippy -p thermoshift-core -p thermoshift-wasm --all-targets -- -D warnings
npm --workspace @thermoshift/web run typecheck
npm --workspace @thermoshift/web run lint
npm --workspace @thermoshift/web run test
npm --workspace @thermoshift/web run build
npm --workspace @thermoshift/web run e2e
```

## Testing

The Rust suite covers canonical references, every scale pair, absolute-zero boundaries, non-finite values, dense cross-scale conversion invariants, and scale direction. Web tests cover local persistence, backup corruption handling, formatting/export utilities, component interactions, first-run onboarding, keyboard quick actions, focus behavior, and restore flows. Playwright exercises both desktop and mobile projects and runs axe checks on primary and onboarding screens.

See [`docs/testing.md`](docs/testing.md) for the full strategy.

## Build and release

Build the PWA with:

```bash
npm --workspace @thermoshift/web run build
```

Desktop packaging requires the platform-specific Tauri prerequisites described in `docs/setup.md`, then:

```bash
npm run desktop:build
```

Tagged `vX.Y.Z` pushes run the release workflow for the web artifact. Desktop signing and store notarization require owner-controlled credentials and are intentionally not stored in this repository. See [`docs/release.md`](docs/release.md).

## Architecture

`thermoshift-core` is the source of truth for conversion and physical validation. The React application calls it through a generated WebAssembly bridge. Tauri also links the same Rust core. This avoids parallel formula implementations drifting apart.

Presentation state is local-first. Browser data is versioned; backup parsing is strict; English product copy is externalized under `apps/web/src/i18n/`; and reusable accessibility behavior such as dialog focus management lives outside individual screens.

See [`docs/architecture.md`](docs/architecture.md) and the ADRs under [`docs/adr`](docs/adr).

## Security and privacy

ThermoShift performs conversions locally. It has no required backend, account, analytics pipeline, or secret API key. The PWA service worker caches application assets for offline use; history, settings, and onboarding state use browser local storage. Export and restore occur only after explicit user action. See [`PRIVACY.md`](PRIVACY.md) and [`SECURITY.md`](SECURITY.md).

## Contributing

Issues and pull requests are welcome. Read [`CONTRIBUTING.md`](CONTRIBUTING.md), follow the Code of Conduct, and include tests for behavior changes.

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
