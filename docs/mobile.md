# Mobile Development

ThermoShift uses the same React frontend and canonical Rust conversion engine on Android and iOS through Tauri 2. The mobile targets do not introduce a second conversion implementation.

## Supported native targets

| Target | Host development systems | ThermoShift command | Notes |
|---|---|---|---|
| Android | Windows, macOS, Linux | `npm run android:dev` | Tauri Android target; minimum SDK 24 |
| Android APK/AAB | Windows, macOS, Linux | `npm run android:build` | Produces Android package outputs after target initialization |
| iOS | macOS only | `npm run ios:dev` | Requires full Xcode installation |
| iOS simulator | macOS only | `npm run ios:build:simulator` | CI-friendly simulator build path |
| iOS device/archive | macOS only | `npm run ios:build` | Apple signing/team configuration is owner-controlled |

Web/PWA, Windows, macOS desktop, and Linux desktop remain supported alongside these mobile targets.

## Shared runtime architecture

`apps/desktop/src-tauri/src/lib.rs` is the native application entry point. It is compiled as `staticlib`, `cdylib`, and `rlib`, and exposes the Tauri `mobile_entry_point` required by Android/iOS shells. The desktop binary in `src/main.rs` delegates to the same `run()` function.

The native commands call `thermoshift-core`, so Celsius/Fahrenheit/Kelvin/Rankine/Réaumur/Delisle/Newton/Rømer conversion and absolute-zero validation remain identical across browser, desktop, Android, and iOS builds.

## Android prerequisites

Install the current Tauri Android prerequisites on the development machine:

- Android Studio;
- Android SDK Platform;
- Android SDK Platform-Tools;
- Android NDK (side by side);
- Android SDK Build-Tools;
- Android SDK Command-line Tools;
- a configured Java runtime (`JAVA_HOME`);
- configured `ANDROID_HOME` and `NDK_HOME`;
- Rust Android targets.

Add the Rust targets with:

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

ThermoShift sets `bundle.android.minSdkVersion` to `24`, matching Tauri's supported Android 7.0 baseline.

## Android initialization and development

Install the locked JavaScript graph first:

```bash
npm ci --ignore-scripts
npm run check:mobile-config
npm run android:init
```

Then run on an emulator or connected device:

```bash
npm run android:dev
```

Build release-form APK and AAB outputs with:

```bash
npm run android:build
```

Run a production-mode build on a device with:

```bash
npm run android:run
```

The Tauri CLI generates the native Android shell under `apps/desktop/src-tauri/gen/android` when the target is initialized. Treat generated native shell files as Tauri-owned output unless a deliberate native customization is being made and reviewed.

## iOS prerequisites

iOS development is macOS-only. Install:

- full Xcode (not only Command Line Tools);
- Rust iOS targets;
- CocoaPods.

Add the Rust targets with:

```bash
rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim
```

Then initialize the target:

```bash
npm ci --ignore-scripts
npm run check:mobile-config
npm run ios:init
```

Run against an iOS simulator or connected device with:

```bash
npm run ios:dev
```

Build the Apple Silicon simulator target with:

```bash
npm run ios:build:simulator
```

For a device/archive build:

```bash
npm run ios:build
```

Apple signing is intentionally not committed. Supply the Apple development team and signing material through the local/CI environment when producing signed device or App Store artifacts.

## Mobile configuration guard

Run:

```bash
npm run check:mobile-config
```

The guard verifies:

- Android/iOS lifecycle scripts remain present;
- the workspace wrappers point to the native package;
- the Tauri identifier remains `in.sanskar.thermoshift`;
- Android minimum SDK remains explicit;
- iOS minimum system version remains explicit;
- an Apple development-team identifier is not hard-coded in Git;
- the Rust crate retains mobile-compatible library crate types;
- the shared Tauri runtime retains `mobile_entry_point`;
- the desktop binary still delegates to the shared runtime.

This check runs in normal CI and the dedicated mobile workflow.

## Hosted mobile verification

`.github/workflows/mobile-platforms.yml` defines exact-candidate native verification:

- Android initializes the Tauri Android shell and builds an ARM64 APK/AAB on Ubuntu;
- iOS initializes the Tauri iOS shell and builds an Apple Silicon simulator target on macOS;
- both jobs consume `package-lock.json` with `npm ci --ignore-scripts`;
- both jobs run `check:mobile-config` before native initialization/build work;
- Android uploads candidate-SHA-qualified package outputs as workflow evidence.

A workflow definition is not proof of support by itself. For a release, record the completed workflow result for the exact candidate SHA in `docs/release-evidence.md`.

## Real-device release evidence

Before calling a mobile release verified, record at least:

- one Android device/emulator launch and conversion smoke test;
- one iOS simulator/device launch and conversion smoke test;
- local persistence behavior;
- offline conversion after app assets are available;
- responsive layout and keyboard/touch accessibility checks appropriate to the platform;
- the exact candidate SHA and OS/device versions used.

Signed store distribution is a separate owner-controlled publication gate.
