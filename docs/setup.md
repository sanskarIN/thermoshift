# Setup

ThermoShift combines a Rust domain engine, a WebAssembly bridge, a React/TypeScript PWA, and a Tauri 2 desktop shell.

## Common prerequisites

Install:

- Git;
- Node.js 22 or newer and npm;
- current stable Rust through `rustup`;
- Rust components `rustfmt` and `clippy`;
- Rust target `wasm32-unknown-unknown`;
- `wasm-pack`.

Verify the installed tools:

```bash
git --version
node --version
npm --version
rustc --version
cargo --version
wasm-pack --version
```

Install the Rust components/target and `wasm-pack` when needed:

```bash
rustup component add rustfmt clippy
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --locked
```

## Clone and install JavaScript dependencies

```bash
git clone https://github.com/sanskarIN/thermoshift.git
cd thermoshift
npm install --ignore-scripts
```

The repository contains a native-tool lockfile-generation workflow but the current v0.2 candidate must not be described as lockfile-reproducible until `package-lock.json` and `Cargo.lock` actually exist in the candidate. When those files are committed, use `npm ci --ignore-scripts` and Cargo `--locked` for reproducibility-sensitive verification. See [`dependency-lockfiles.md`](dependency-lockfiles.md).

## Repository metadata checks

These checks do not require the web application to be running:

```bash
npm run check:versions
npm run check:desktop-config
npm run check:docs
```

They verify application version alignment, Tauri frontend paths/configuration, and internal Markdown file links.

## Web/PWA development

Start the application:

```bash
npm run dev
```

The web workspace builds the Rust WebAssembly bridge before Vite starts. Vite normally serves the app at `http://localhost:5173`.

Build the production PWA and enforce its asset budget:

```bash
npm --workspace @thermoshift/web run build
npm run check:web-budget
```

## Tests and linting

```bash
cargo fmt --all -- --check
cargo test -p thermoshift-core
cargo clippy -p thermoshift-core -p thermoshift-wasm --all-targets -- -D warnings
npm --workspace @thermoshift/web run typecheck
npm --workspace @thermoshift/web run lint
npm --workspace @thermoshift/web run test
```

For browser E2E/accessibility checks, install Chromium once:

```bash
npx playwright install chromium
npm --workspace @thermoshift/web run e2e
```

The E2E suite uses the production/WASM-backed build and includes conversion, local persistence, offline reload, keyboard navigation, Settings/update surfaces, and axe accessibility checks.

## Verified product screenshot capture

The screenshot suite is separate from regression E2E so release captures remain intentional:

```bash
npm --workspace @thermoshift/web run screenshots
npm run check:screenshots
```

The capture command writes product screenshots under `docs/screenshots/`; the verifier requires the exact expected PNG set and validates image headers, minimum size, and dimensions. The hosted `Verified Product Screenshots` workflow provides the same capture path for maintainers.

## Desktop development

Install the current Tauri 2 native prerequisites for your operating system. These include platform toolchains such as Microsoft C++/WebView components on Windows, Xcode command-line tooling on macOS, and WebKitGTK/build dependencies on Linux. Use current Tauri platform prerequisite documentation because package names vary by OS/distribution version.

Verify the repository-side desktop configuration first:

```bash
npm run check:desktop-config
```

Then run:

```bash
npm run desktop:dev
```

Build the current platform package with:

```bash
npm run desktop:build
```

The manual `Desktop Platform Verification` workflow provides unsigned Windows/macOS/Linux CI build evidence. Signing/notarization is intentionally separate and requires owner-controlled credentials outside source control.

## Desktop branding

The editable source logo is `apps/web/public/logo.svg`. Generate Tauri platform icons with:

```bash
npm --workspace @thermoshift/desktop run icons
```

Do not claim generated desktop branding is complete until the resulting `apps/desktop/src-tauri/icons/` files actually exist in the candidate. The hosted `Refresh Desktop Icons` workflow provides a reproducible maintainer path.

## Environment and secrets

Core ThermoShift conversion requires no production secret. `.env.example` contains placeholders only. Never put credentials, signing keys, tokens, private endpoints, or real user data in tracked files.

## Additional references

- [`development.md`](development.md) — code-change workflow and architecture boundaries.
- [`testing.md`](testing.md) — test strategy.
- [`release.md`](release.md) — release process.
- [`release-evidence.md`](release-evidence.md) — exact-candidate evidence template.
- [`troubleshooting.md`](troubleshooting.md) — common setup/runtime problems.
