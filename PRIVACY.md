# Privacy

ThermoShift is designed to work without an account or conversion server.

## Data stored locally

The web/PWA may store:

- display preferences such as theme, precision, rounding, high contrast, and reduced motion;
- conversion history explicitly saved by the user;
- whether the first-run onboarding has been completed;
- offline application assets controlled by the service worker.

These items remain in browser-managed storage for the current origin/profile unless the user exports them or the browser synchronizes storage through a browser feature outside ThermoShift's control.

## Backup and restore

The Settings page can create a full ThermoShift backup as a JSON file. The backup contains:

- a schema version;
- the export timestamp;
- ThermoShift settings;
- explicitly saved conversion history.

Creating a backup is an explicit local action. ThermoShift does not upload the file. After download, its location, copies, synchronization, and sharing are controlled by the user and operating system/browser.

Restore reads a file selected by the user. ThermoShift validates the supported schema and validates every saved conversion before accepting the backup. Invalid or unsupported backup files are rejected instead of partially restoring untrusted records. The selected file is processed locally and is not sent to a ThermoShift server.

The History page also offers a history-only JSON export. Batch conversion offers CSV export. Those files are likewise controlled by the user after download.

## Data not required by ThermoShift

ThermoShift does not require names, passwords, payment information, contacts, location, advertising identifiers, analytics identifiers, or a cloud account to convert temperatures.

## Clearing data

Individual saved history records can be removed. History can also be cleared from the History screen with an in-app undo opportunity. The Settings screen can reset ThermoShift settings, history, and onboarding state after a confirmation. Browser site settings can also remove local PWA storage and caches.

Resetting browser-managed data cannot delete backup/export files that were already downloaded outside browser storage.

## Network behavior

Core conversion does not require network access. The installed PWA can use cached application assets offline. External links are only opened after an explicit user action.

## External links

The About and documentation surfaces link to GitHub, email, and Buy Me a Coffee. Opening those services is subject to their own privacy practices.

Questions: `supportramsandesh@gmail.com`.
