# Mobile Development and Packaging

ThermoShift uses the same Tauri 2 Rust runtime and the same React/WebAssembly frontend on desktop, Android, and iOS. The native Rust crate is built as `staticlib`, `cdylib`, and `rlib`, with `src/lib.rs` providing the shared Tauri entry point.

## Supported mobile baseline

| Platform | Native target | Minimum configured version | Host requirements |
|---|---|---:|---|
| Android | Tauri 2 + Android WebView | Android 7.0 / API 24 | Windows, macOS, or Linux with Android Studio tooling |
| iOS / iPadOS | Tauri 2 + WKWebView | iOS 14.0 | macOS with the full Xcode app |
| Mobile browser | Installable PWA | Current evergreen browser | Any supported browser |

The web/PWA build remains a fallback when a native package is not required.

## Common prerequisites

Install the repository prerequisites first:

```bash
rustup component add rustfmt clippy
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --locked
npm install
npm run native:info
npm run verify:native-config
```

`npm run verify:native-config` is dependency-free and checks that the Tauri identifier, mobile minimum versions, shared-library crate types, mobile entry point, and root/native lifecycle commands remain consistent.

## Android setup

Install Android Studio and use its SDK Manager to install the current Android SDK Platform, Platform-Tools, Build-Tools, Command-line Tools, and NDK (Side by side). Configure `JAVA_HOME`, `ANDROID_HOME`, and `NDK_HOME` for your operating system.

Add Rust's Android targets:

```bash
rustup target add \
  aarch64-linux-android \
  armv7-linux-androideabi \
  i686-linux-android \
  x86_64-linux-android
```

Initialize the generated Android project once on a configured development machine:

```bash
npm run android:init
```

Run on an emulator or attached device:

```bash
npm run android:dev
```

For a physical device when the development server must be reachable over the local network:

```bash
npm run android:dev:host
```

ThermoShift's Vite configuration reads `TAURI_DEV_HOST`, binds the development server to the selected network address, and configures HMR for mobile development.

### Build an Android APK

For local/testing APKs split by ABI:

```bash
npm run android:apk
```

Tauri writes Android build outputs under:

```text
apps/desktop/src-tauri/gen/android/app/build/outputs/
```

### Build an Android App Bundle

For Google Play packaging:

```bash
npm run android:aab
```

A production Play Store upload must be signed with an owner-controlled Android signing key. Never commit keystores, passwords, signing properties, or credentials.

## iOS and iPadOS setup

iOS development is macOS-only and requires the full Xcode application. Install the Rust iOS targets:

```bash
rustup target add \
  aarch64-apple-ios \
  x86_64-apple-ios \
  aarch64-apple-ios-sim
```

Install CocoaPods when required by the current Tauri/Xcode environment:

```bash
brew install cocoapods
```

Initialize the generated Apple project once:

```bash
npm run ios:init
```

Run in the simulator or on a configured device:

```bash
npm run ios:dev
```

For a physical device with a LAN-hosted development server:

```bash
npm run ios:dev:host
```

Build with the configured Apple signing identity:

```bash
npm run ios:build
```

For CI-oriented compilation where signing is intentionally unavailable:

```bash
npm run ios:build:unsigned
```

App Store distribution still requires a valid Apple Developer team, bundle identifier registration, certificates/provisioning, and App Store Connect configuration. Those credentials belong in secure local keychains or repository secrets, never in source control.

## Generated native projects

`tauri android init` and `tauri ios init` generate platform projects below `apps/desktop/src-tauri/gen/`. Do not hand-create those files to imitate Tauri output.

For the current shared-code baseline, initialize them using the installed Tauri CLI on a real platform toolchain. If ThermoShift later adds native Kotlin/Java or Swift/Objective-C customizations, review and commit the generated platform projects together with those intentional native changes so they become reproducible and reviewable.

## PWA installation on phones and tablets

The web app remains installable as a PWA. Supported browsers can trigger ThermoShift's in-app **Install app** control when the `beforeinstallprompt` event is available. On platforms that use a browser-specific Add to Home Screen flow, use the browser's standard installation UI.

The PWA includes standalone display metadata, mobile safe-area support, 44-pixel touch targets, dynamic viewport sizing, offline caching, and local-only settings/history.

## Pre-release mobile checklist

Before claiming a mobile release is production-ready:

1. Run `npm run verify:native-config`.
2. Run the full Rust and web quality gates documented in `docs/testing.md`.
3. Initialize the current Tauri Android/iOS projects with the same CLI version used by the repository.
4. Test installation, launch, conversion, history, settings, offline behavior, screen rotation, light/dark mode, and accessibility on real hardware where possible.
5. Test Android back/navigation behavior and iOS safe areas.
6. Generate store-ready icons and screenshots from actual builds.
7. Configure signing only through secure secrets/key stores.
8. Verify package identifiers and version numbers before upload.
9. Review the final APK/AAB/IPA or archive on the target platform.
10. Update `CHANGELOG.md`, `what_changed.md`, and release notes with only verified platform claims.

## Troubleshooting

### Mobile device cannot reach the Vite server

Use the host-aware command:

```bash
npm run android:dev:host
# or
npm run ios:dev:host
```

Confirm the development computer and device can communicate on the same network and that the operating-system firewall permits the Vite/HMR ports.

### Tauri reports a missing mobile target

Re-run the corresponding `rustup target add ...` command from this guide and confirm with:

```bash
rustup target list --installed
```

### Android SDK/NDK cannot be found

Verify `JAVA_HOME`, `ANDROID_HOME`, and `NDK_HOME`, then restart the terminal/IDE so it receives the updated environment.

### iOS command is unavailable

Run iOS commands on macOS with the full Xcode application installed and selected. iOS builds are not supported from Windows or Linux hosts.

## Upstream references

For platform tool versions and signing requirements that can change over time, verify against the current Tauri documentation before a release:

- <https://v2.tauri.app/start/prerequisites/>
- <https://v2.tauri.app/reference/cli/>
- <https://v2.tauri.app/distribute/>
- <https://v2.tauri.app/distribute/google-play/>
- <https://v2.tauri.app/distribute/app-store/>
