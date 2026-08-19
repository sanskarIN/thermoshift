# Release Process

1. Start from a clean checkout of `main`.
2. Install dependencies and build the WASM bridge.
3. Run formatting, linting, type checks, Rust tests, web tests, E2E tests, and production builds.
4. Review dependency/security alerts and ensure no blocker/high issues remain.
5. Update `CHANGELOG.md`, `ROADMAP.md`, and `what_changed.md`.
6. Update package/crate/Tauri versions consistently.
7. Capture real screenshots from release builds.
8. Create an annotated semantic version tag such as `v0.1.0` and push it.
9. Verify the GitHub release workflow and artifact checksums.
10. Build desktop installers on their native operating systems. Signing/notarization credentials must come from repository secrets or local secure key stores, never source control.

The current automated release workflow publishes the web artifact. Desktop release automation can be enabled after the owner configures signing requirements for each operating system.
