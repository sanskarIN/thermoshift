# Dependency Lockfiles

ThermoShift commits application dependency lockfiles so clean builds resolve the same dependency graph until maintainers intentionally refresh it.

## Expected lockfiles

- `package-lock.json` for the npm workspace.
- `Cargo.lock` for the Rust/Tauri application workspace.

Do not hand-write either lockfile and do not copy generated dependency metadata from an unrelated project.

## Local refresh

From a clean checkout with supported Node.js/npm and Rust toolchains:

```bash
npm install --ignore-scripts --package-lock-only
cargo generate-lockfile
npm run check:versions
npm run check:desktop-config
```

Review the dependency diff and relevant upstream/security notes before committing.

## Hosted refresh

The manual **Refresh Lockfiles** GitHub Actions workflow performs the same generation on the selected repository ref, verifies both lockfiles exist, uses the Git author identity `Sanskar <sanskarin@outlook.in>`, and commits only when either lockfile changes.

The workflow is intentionally `workflow_dispatch`-only. It does not rewrite dependency graphs automatically on every pull request or scheduled run.

After a refresh, normal CI/security workflows remain the verification gate. A generated lockfile is reproducibility metadata, not evidence that builds/tests/security checks pass.
