# Accessibility

ThermoShift targets WCAG-oriented accessibility practices rather than treating accessibility as a late visual pass.

## Implemented behavior

- Semantic headings, labels, tables, navigation, status/error roles, and descriptive link text.
- Skip link and visible `:focus-visible` treatment.
- Standard keyboard navigation throughout controls and links.
- Page shortcuts: `Alt+1` through `Alt+6`.
- Quick Actions shortcut: `Ctrl+K` on Windows/Linux and `⌘+K` on macOS.
- Quick Actions search lets keyboard users jump directly to Converter, Batch, History, Formulas, Settings, or About.
- Modal dialogs move focus inside when opened, contain `Tab`/`Shift+Tab` navigation, support Escape where dismissal is appropriate, and return focus to the previously focused control when unmounted.
- First-run onboarding begins with its primary action focused and does not require pointer input.
- Converter validation uses `aria-invalid`, an alert message, and descriptive helper text rather than color alone.
- Offline, copy/share, backup/restore, and undo feedback use status or alert semantics where appropriate.
- History delete buttons expose the source and destination scale in their accessible names.
- High-contrast preference.
- Reduced-motion preference plus system `prefers-reduced-motion` handling.
- Responsive layouts and touch-sized primary controls.
- No product status is intentionally communicated only by color.
- axe automation runs against both the primary converter screen and first-run onboarding in Playwright.

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

- Component tests exercise focus placement, Escape handling, Tab wrapping, invalid-field semantics, and keyboard page navigation.
- Playwright tests run axe against primary and onboarding states.
- Playwright configuration includes desktop Chromium and a Pixel 7 mobile emulation project.

Automated tooling cannot prove accessibility by itself.

## Manual release review

Before stable releases, verify:

1. Keyboard-only operation through all pages, dialogs, backup/restore, and destructive actions.
2. Zoom to 200% without loss of required content or functionality.
3. System high contrast where available.
4. Reduced-motion behavior.
5. At least one mainstream screen reader on each primary desktop family.
6. Touch target usability on a real small-screen device.
7. Error announcements and focus recovery after dialogs close.

Accessibility defects should be treated as functional defects and receive regression coverage where practical.
