## Summary

Describe the user-visible or engineering change, why it is needed, and the main affected modules/platforms.

## Verification

Check only what you actually ran or reviewed for this change.

- [ ] `npm run check:versions` passes when version/product metadata is affected.
- [ ] `npm run check:desktop-config` passes when desktop/build configuration is affected.
- [ ] `npm run check:docs` passes when Markdown/documentation is affected.
- [ ] Rust formatting/tests/Clippy pass where relevant.
- [ ] Web TypeScript/ESLint/Vitest coverage passes where relevant.
- [ ] Production PWA build and `npm run check:web-budget` pass for runtime/bundle changes.
- [ ] Relevant Playwright E2E/axe journeys pass for user-facing behavior.
- [ ] Native desktop build/check evidence is included for platform-specific changes when practical.

## Data, privacy, and security

- [ ] Untrusted inputs are validated at the appropriate boundary.
- [ ] Persistence/backup schema compatibility or migration impact was considered.
- [ ] Logs/errors do not expose secrets, credentials, PII, or unnecessary user content.
- [ ] No secrets, signing keys, private endpoints, personal data, or generated credentials are included.
- [ ] Dependency/permission/CSP changes were reviewed for security impact.

## Accessibility and UX

- [ ] Keyboard/focus behavior was considered.
- [ ] Status/error states are not color-only and use appropriate semantics.
- [ ] Reduced motion, contrast, zoom/responsive behavior, and touch targets were considered where relevant.
- [ ] User-visible static copy remains externalized through the locale module where appropriate.

## Documentation

- [ ] README/docs/changelog/roadmap/handoff files were updated when behavior, architecture, setup, or release requirements changed.
- [ ] New architectural decisions are recorded in `docs/adr/` when the decision is non-obvious and expected to persist.

## Screenshots

For UI changes, add real before/after or release captures when they materially help review. Do not present mockups/placeholders as verified product screenshots. The maintained capture path is `npm --workspace @thermoshift/web run screenshots` followed by `npm run check:screenshots`.

## Release impact

Describe any release blocker, migration, platform limitation, generated-asset requirement, or follow-up evidence that must remain open. Do not mark a release gate passed without evidence for the exact candidate commit.
