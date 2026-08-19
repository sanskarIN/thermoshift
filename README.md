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

ThermoShift is a production-oriented temperature converter for Web/PWA and Windows, macOS, and Linux through Tauri. Its conversion rules live in one Rust domain engine, exposed to the browser through WebAssembly, with local-only history and settings.

## Highlights

- Celsius, Fahrenheit, Kelvin, Rankine, Réaumur, Delisle, Newton, and Rømer.
- Validates every input against absolute zero.
- Instant bidirectional conversion with configurable precision and rounding.
- Reference cards for absolute zero, freezing, room temperature, body temperature, and boiling.
- Batch conversion with CSV export.
- Local conversion history with JSON export.
- Formula guide with educational notes.
- Offline installable PWA.
- Light, dark, system, high-contrast, reduced-motion, keyboard navigation, and responsive layouts.
- Copy/share support without a server.
- Open-source MIT license and no required account.

## Screenshots

Real release screenshots are captured as part of the release checklist. Until the first packaged release, run the app locally using the quick start below.

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

Then open the URL shown by Vite (normally `http://localhost:5173`).

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

See [`docs/architecture.md`](docs/architecture.md) and the ADRs under [`docs/adr`](docs/adr).

## Security and privacy

ThermoShift performs conversions locally. It has no required backend, account, analytics pipeline, or secret API key. The PWA service worker caches application assets for offline use; history and settings use browser local storage. See [`PRIVACY.md`](PRIVACY.md) and [`SECURITY.md`](SECURITY.md).

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
