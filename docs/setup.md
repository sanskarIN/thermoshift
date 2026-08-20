# Setup

## Common prerequisites

- Git.
- Current stable Rust with `rustfmt`, `clippy`, and target `wasm32-unknown-unknown`.
- Node.js 22.x and npm 10.9.x. The root `package.json` enforces the supported range and `.nvmrc` selects Node 22 for compatible version managers.
- `wasm-pack`.

```bash
rustup component add rustfmt clippy
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --locked
npm install
npm run verify:native-config
```

`npm run verify:native-config` checks the repository's desktop/Android/iOS Tauri invariants without requiring a platform SDK. The repository also has a lockfile verification workflow that regenerates npm and Cargo lockfiles on dependency-manifest changes and rejects drift once the reviewed lockfiles are committed.

## Web/PWA

```bash
npm run dev
```

The `predev` script builds the Rust WebAssembly bridge before Vite starts. The production build is installable as a PWA and includes offline caching plus mobile standalone metadata.

## Desktop: Windows, macOS, and Linux

Install the current Tauri 2 system prerequisites for your operating system. These typically include WebView2 on supported Windows systems, Xcode command-line tooling on macOS, and WebKitGTK/build packages on Linux. Use the official Tauri prerequisites documentation for platform-version-specific package names because distro packages evolve.

Inspect the native environment:

```bash
npm run native:info
```

Run the desktop app:

```bash
npm run desktop:dev
```

Build desktop packages:

```bash
npm run desktop:build
```

## Android

ThermoShift is configured for Android 7.0 / API 24 and newer. Android development requires Android Studio, the SDK/Platform Tools/Build Tools/Command-line Tools, NDK, Java configuration, and the Android Rust targets.

After completing the prerequisites in [`mobile.md`](mobile.md):

```bash
npm run android:init
npm run android:dev
```

For a physical device on the local network:

```bash
npm run android:dev:host
```

For packaging:

```bash
npm run android:apk
npm run android:aab
```

## iOS and iPadOS

ThermoShift is configured for iOS/iPadOS 14 and newer. iOS development requires macOS with the full Xcode application plus the Rust Apple mobile targets. See [`mobile.md`](mobile.md) for setup and signing details.

```bash
npm run ios:init
npm run ios:dev
npm run ios:build
```

For a physical device on the local network:

```bash
npm run ios:dev:host
```

An unsigned CI-oriented build command is also exposed:

```bash
npm run ios:build:unsigned
```

## Environment

No production secret is required for the application itself. Copy `.env.example` only when adding deployment-specific, non-secret configuration. Never put API credentials, Android keystores/passwords, Apple certificates/provisioning profiles, or other signing secrets in tracked files.

## Platform documentation

- Mobile development and packaging: [`docs/mobile.md`](mobile.md)
- Development workflow: [`docs/development.md`](development.md)
- Testing: [`docs/testing.md`](testing.md)
- Release process: [`docs/release.md`](release.md)
