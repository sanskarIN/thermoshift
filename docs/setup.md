# Setup

## Common prerequisites

- Git.
- Current stable Rust with `rustfmt`, `clippy`, and target `wasm32-unknown-unknown`.
- Node.js 22 or newer and npm.
- `wasm-pack`.

```bash
rustup component add rustfmt clippy
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --locked
npm install
```

## Web/PWA

```bash
npm run dev
```

The `predev` script builds the Rust WebAssembly bridge before Vite starts.

## Desktop

Install the current Tauri 2 system prerequisites for your operating system. These typically include WebView2 on supported Windows systems, Xcode command-line tooling on macOS, and WebKitGTK/build packages on Linux. Use the official Tauri prerequisites documentation for platform-version-specific package names because distro packages evolve.

From the repository root, run:

```bash
npm run desktop:dev
```

## Environment

No production secret is required. Copy `.env.example` only when adding deployment-specific, non-secret configuration. Never put credentials in tracked files.
