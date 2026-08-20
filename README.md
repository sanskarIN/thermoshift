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

ThermoShift is a production-oriented temperature converter for browsers, installable PWA environments, Windows, macOS, Linux, Android, and iOS/iPadOS. Its conversion rules live in one Rust domain engine, exposed to the browser through WebAssembly and shared by the Tauri native runtime, with local-only history and settings.

## Highlights

- Celsius, Fahrenheit, Kelvin, Rankine, Réaumur, Delisle, Newton, and Rømer.
- Validates every input against absolute zero.
- Instant bidirectional conversion with configurable precision and rounding.
- Reference cards for absolute zero, freezing, room temperature, body temperature, and boiling.
- Batch conversion with CSV export.
- Local conversion history with JSON export.
- Formula guide with educational notes.
- Offline installable PWA with an in-app install action when supported by the browser.
- Native Tauri 2 targets for desktop, Android, and iOS using one shared Rust entry point.
- Mobile safe-area handling, dynamic viewport sizing, coarse-pointer behavior, and touch-friendly controls.
- Light, dark, system, high-contrast, reduced-motion, keyboard navigation, and responsive layouts.
- Copy/share support without a server.
- Open-source MIT license and no required account.

## Supported platforms

| Platform | Delivery | Current support |
|---|---|---|
| Modern browsers | React + WebAssembly | Primary |
| Installable PWA | Vite PWA | Primary |
| Windows | Tauri 2 | Configured native target |
| macOS | Tauri 2 | Configured native target |
| Linux | Tauri 2 | Configured native target |
| Android 7.0+ / API 24+ | Tauri 2 mobile | Configured native target |
| iOS/iPadOS 14+ | Tauri 2 mobile | Configured native target; builds require macOS/Xcode |

“Configured native target” means the source tree, commands, bundle metadata, and shared runtime support the target. A platform is only promoted to a verified release after real packaging/smoke-test evidence is completed for that release.

## Tech stack

- Rust for canonical temperature domain logic.
- `wasm-bindgen`/`wasm-pack` for the web bridge.
- React + TypeScript + Vite for the PWA.
- Tauri 2 for Windows, macOS, Linux, Android, and iOS native packaging.
- Vitest, Testing Library, Playwright, and axe for automated quality checks.
- GitHub Actions, CodeQL, dependency audits, Dependabot, and native configuration invariants for repository automation.

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

- [`docs/setup.md`](docs/setup.md) — common and desktop prerequisites.
- [`docs/mobile.md`](docs/mobile.md) — Android, iOS/iPadOS, mobile PWA, signing, and device workflows.
- [`docs/development.md`](docs/development.md) — architecture-aware development workflow.
- [`docs/testing.md`](docs/testing.md) — quality gates.

Useful commands:

```bash
cargo test -p thermoshift-core
cargo fmt --all -- --check
cargo clippy -p thermoshift-core -p thermoshift-wasm --all-targets -- -D warnings
npm run verify:native-config
npm --workspace @thermoshift/web run typecheck
npm --workspace @thermoshift/web run lint
npm --workspace @thermoshift/web run test
npm --workspace @thermoshift/web run build
npm --workspace @thermoshift/web run e2e
```

## Native development

Inspect the Tauri/native environment:

```bash
npm run native:info
```

Desktop:

```bash
npm run desktop:dev
npm run desktop:build
```

Android after completing [`docs/mobile.md`](docs/mobile.md):

```bash
npm run android:init
npm run android:dev
npm run android:apk
npm run android:aab
```

For a physical Android device that must reach the development host over the LAN:

```bash
npm run android:dev:host
```

iOS/iPadOS on macOS after completing [`docs/mobile.md`](docs/mobile.md):

```bash
npm run ios:init
npm run ios:dev
npm run ios:build
```

For a physical iOS device:

```bash
npm run ios:dev:host
```

## Build and release

Build the PWA with:

```bash
npm --workspace @thermoshift/web run build
```

Tagged `vX.Y.Z` pushes run the web release workflow. Native signing, notarization, Play Store signing, and App Store provisioning require owner-controlled credentials and are intentionally not stored in this repository. See [`docs/release.md`](docs/release.md) and [`docs/mobile.md`](docs/mobile.md).

## Architecture

`thermoshift-core` is the source of truth for conversion and physical validation. The React application calls it through a generated WebAssembly bridge. The Tauri native library also links the same Rust core and exposes one shared `run()` entry point for desktop and mobile. This avoids parallel formula implementations drifting apart.

See [`docs/architecture.md`](docs/architecture.md) and the ADRs under [`docs/adr`](docs/adr).

## Security and privacy

ThermoShift performs conversions locally. It has no required backend, account, analytics pipeline, or secret API key. The PWA service worker caches application assets for offline use; history and settings use browser local storage. Native targets package the same local-first application shell. See [`PRIVACY.md`](PRIVACY.md) and [`SECURITY.md`](SECURITY.md).

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
