# Browser Extension Delivery

ThermoShift's browser extension is next-version work. The first source foundation lives under `apps/extension` and deliberately depends on the hardened canonical Rust/WASM engine instead of introducing a second JavaScript conversion implementation.

## Current foundation

- Manifest V3 popup application.
- Zero requested browser permissions.
- Zero host permissions.
- Local-only extension content security policy with WebAssembly enabled.
- Eight temperature scales supplied by the canonical `thermoshift-core` engine through `thermoshift-wasm`.
- Accessible labels, keyboard-focus treatment, live result output, reduced-motion handling, and native light/dark color-scheme support.
- Source-level version alignment with the repository.
- Dependency-free configuration verification and packaging scripts.

## Commands

```bash
npm run verify:extension-config
npm run extension:build
```

`verify:extension-config` is SDK-independent. `extension:build` requires `wasm-pack` because it compiles the reviewed Rust engine into the package rather than copying formulas into extension JavaScript.

## Security and privacy contract

The base converter popup does not need access to tabs, browsing history, page content, cookies, storage outside the extension, network hosts, clipboard, downloads, or background execution. Do not add a permission merely for convenience. Any future permission must have a concrete user-facing feature, least-privilege scope, tests, documentation, and a release review.

Remote code is prohibited. Store packages must contain all executable JavaScript and WebAssembly locally. The extension must remain useful offline and must not introduce analytics or account requirements into ThermoShift's local-first conversion path.

## Compatibility stages

### Stage 1 — Chromium development

Verify the unpacked package in current Chrome and Edge builds:

- popup opens without console errors;
- Rust/WASM engine initializes from extension URLs;
- all eight units convert correctly;
- invalid/physically impossible values are rejected;
- swap preserves the entered value and reverses units;
- popup is fully keyboard usable;
- zoom and OS light/dark modes remain usable;
- no unexpected permission prompt appears.

### Stage 2 — Firefox compatibility

After the Manifest V3 foundation is proven, add the minimum Firefox-specific metadata/build output required by the then-current Firefox extension platform. Keep shared popup logic identical and avoid browser-specific conversion behavior.

### Stage 3 — Automated browser-extension E2E

Add Playwright or browser-specific extension harness coverage for initialization, conversion, validation, keyboard operation, CSP violations, and permission regression checks. Automated tests do not replace manual browser/store verification.

### Stage 4 — Store-ready assets and packages

Generate reviewed extension icons and store artwork from ThermoShift branding, produce deterministic ZIP packages, record checksums, and validate package contents before upload. Chrome Web Store and Firefox Add-ons signing/publication credentials remain owner-controlled and outside Git.

## Release gate

Do not describe the extension as supported or published merely because the source scaffold exists. A release claim requires a package built from an identified commit, browser-version smoke evidence, extension-specific security review, permission review, real screenshots, package checksum, and successful store validation where applicable.
