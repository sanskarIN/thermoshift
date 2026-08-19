# Accessibility

ThermoShift targets WCAG-oriented accessibility practices rather than treating accessibility as a late visual pass.

## Implemented behavior

- Semantic headings, labels, tables, navigation, status/error roles, and descriptive link text.
- Skip link and visible `:focus-visible` treatment.
- Standard keyboard navigation throughout controls and links.
- Page shortcuts: `Alt+1` through `Alt+6`.
- Quick Actions shortcut: `Ctrl+K` on Windows/Linux and `⌘+K` on macOS.
- Shortcut-capable controls expose `aria-keyshortcuts`; visible `<kbd>` hints are hidden from the accessibility tree so shortcut text is not spoken twice as part of the control name.
- Client-side page changes update the document title and a persistent polite live region so navigation is announced without requiring focus to be moved unexpectedly.
- Quick Actions search lets keyboard users jump directly to Converter, Batch, History, Formulas, Settings, or About.
- Modal dialogs move focus inside when opened, contain `Tab`/`Shift+Tab` navigation, support Escape where dismissal is appropriate, and return focus to the previously focused control when unmounted.
- First-run onboarding begins with its primary action focused and does not require pointer input.
- Converter validation uses `aria-invalid`, an alert message, and descriptive helper text rather than color alone.
- Batch input exposes its processing limits through `aria-describedby` and marks an over-limit field invalid before conversion work begins.
- Offline, copy/share, backup/restore, and undo feedback use status or alert semantics where appropriate.
- History delete buttons expose the source and destination scale in their accessible names.
- High-contrast preference.
- Reduced-motion preference plus system `prefers-reduced-motion` handling.
- Responsive layouts and touch-sized primary controls.
- No product status is intentionally communicated only by color.
- axe automation runs against primary, onboarding, and Settings surfaces in the primary E2E suite, plus the primary converter in Chromium, Firefox, and WebKit compatibility smoke tests.

## Keyboard reference

| Shortcut | Action |
|---|---|
| `Ctrl/⌘+K` | Open Quick Actions |
| `Alt+1` | Converter |
| `Alt+2` | Batch |
| `Alt+3` | History |
| `Alt+4` | Formulas |
| `Alt+5` | Settings |
| `Alt+6` | About |
| `Tab` / `Shift+Tab` | Move through interactive controls |
| `Escape` | Close Quick Actions |

Shortcuts supplement normal navigation and are never the only way to reach a feature.

## Automated coverage

- Component/application tests exercise focus placement, Escape handling, Tab wrapping, invalid-field semantics, keyboard page navigation, live-region page announcements, title synchronization, shortcut metadata, and bounded batch-input semantics.
- The primary Playwright suite runs axe against converter, onboarding, and Settings states.
- The primary Playwright configuration includes desktop Chromium and a Pixel 7 mobile emulation project.
- The cross-browser Playwright configuration independently runs a primary-screen axe scan in Chromium, Firefox, and WebKit.

Automated tooling cannot prove accessibility by itself.

## Manual release review

Before stable releases, verify:

1. Keyboard-only operation through all pages, dialogs, backup/restore, and destructive actions.
2. Page-change announcements and title changes with a mainstream screen reader.
3. Zoom to 200% without loss of required content or functionality.
4. System high contrast where available.
5. Reduced-motion behavior.
6. At least one mainstream screen reader on each primary desktop family.
7. Touch target usability on a real small-screen device.
8. Error announcements and focus recovery after dialogs close.

Accessibility defects should be treated as functional defects and receive regression coverage where practical.