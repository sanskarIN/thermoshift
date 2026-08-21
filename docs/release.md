# Release Process

ThermoShift treats source-level target support and verified release support as separate states. A target is not called release-ready until its package has been built and smoke-tested on the appropriate toolchain for that release.

## Release checklist

1. Start from a clean checkout of `main`.
2. Install the committed dependency graph with `npm ci` and use Cargo commands with `--locked`; build the WASM bridge.
3. Run `npm run verify:native-config`.
4. Run formatting, linting, type checks, Rust tests, web tests, E2E tests, and production builds.
5. Review dependency/security alerts and ensure no blocker/high issues remain.
6. Update `CHANGELOG.md`, `ROADMAP.md`, and `what_changed.md`.
7. Update package/crate/Tauri versions consistently and regenerate/review both lockfiles if dependency manifests changed.
8. Capture real screenshots from verified release builds.
9. Create an annotated semantic version tag such as `v0.1.0` and push it.
10. Verify the GitHub web release workflow and artifact contents.
11. Build and smoke-test native packages on their required platforms.
12. Sign/notarize/store-package only with owner-controlled credentials supplied from secure local stores or repository secrets.
13. Publish release notes containing only claims backed by the completed checks.

## Web/PWA

Build:

```bash
npm ci
npm --workspace @thermoshift/web run build
```

Tagged `vX.Y.Z` pushes currently publish the web artifact through `.github/workflows/release.yml`, and that workflow uses `npm ci` so the released web bundle is built from the reviewed lockfile.

Verify at minimum:

- first online load;
- installability where the browser supports PWA installation;
- offline reload after caching;
- conversion and validation;
- local history/settings persistence;
- light/dark/high-contrast/reduced-motion behavior;
- keyboard and mobile/touch navigation.

## Windows, macOS, and Linux

Build on each target operating system using:

```bash
npm run desktop:build
```

Do not use a package built on one desktop operating system as evidence that another operating system works. Signing/notarization requirements differ by platform.

## Android

Complete [`mobile.md`](mobile.md), initialize the Android project with the current Tauri CLI, and verify the app on an emulator and preferably real hardware.

Testing APKs:

```bash
npm run android:apk
```

Google Play bundle:

```bash
npm run android:aab
```

A production upload requires an owner-controlled Android signing key and secure signing configuration. Keystores and passwords must never be committed.

## iOS and iPadOS

Builds require macOS with the full Xcode environment. Initialize the Apple project with the current Tauri CLI and verify on the simulator plus real hardware when available.

Signed build:

```bash
npm run ios:build
```

Unsigned CI-oriented compilation when signing is intentionally unavailable:

```bash
npm run ios:build:unsigned
```

App Store distribution requires the registered bundle identifier, Apple Developer team, certificates/provisioning or App Store Connect credentials, and a signed archive/package.

## Version consistency

Before tagging, verify that versions agree wherever they are explicitly declared, including:

- root `package.json`;
- `apps/web/package.json`;
- `apps/desktop/package.json`;
- `apps/desktop/src-tauri/Cargo.toml`;
- `apps/desktop/src-tauri/tauri.conf.json`.

Android version codes and Apple bundle versions may have store-specific constraints. Review the current Tauri/platform documentation before a store release.

## Required release evidence

Keep enough evidence to reproduce the release decision:

- commit/tag SHA;
- completed CI checks;
- package filenames/checksums where published;
- target OS/device versions used for smoke testing;
- known limitations;
- screenshots captured from real release builds;
- confirmation that signing secrets were supplied securely and were not committed.

## Current automation boundary

The tagged release workflow automatically publishes the web artifact. Native packages remain explicit platform builds until their signing/notarization/store credentials and release runners are configured and verified. This is intentional: ThermoShift must not fabricate signed packages or imply a native release was tested when it was not.
