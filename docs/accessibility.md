# Accessibility

ThermoShift targets WCAG-oriented accessibility practices rather than treating accessibility as a late visual pass.

Implemented baseline:

- semantic headings, labels, tables, navigation, status/error roles, and link text;
- skip link and visible focus treatment;
- keyboard shortcuts (`Alt+1` through `Alt+6`) plus normal tab navigation;
- high-contrast preference;
- reduced-motion preference plus system reduced-motion handling;
- responsive layouts and touch-sized primary controls;
- no status communicated only by color;
- axe automation in Playwright.

Before stable releases, manually verify keyboard-only operation, zoom to 200%, system high contrast where available, and at least one mainstream screen reader on each primary desktop family.
