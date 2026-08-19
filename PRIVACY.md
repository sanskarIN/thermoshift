# Privacy

ThermoShift is designed to work without an account or conversion server.

## Data stored locally

The web/PWA may store:

- display preferences such as theme, precision, rounding, high contrast, and reduced motion;
- conversion history explicitly saved by the user;
- whether first-run onboarding has been completed;
- offline application assets controlled by the service worker.

These items remain in browser-managed storage for the current origin/profile unless the user exports them or the browser synchronizes storage through a browser feature outside ThermoShift's control.

Saved history is bounded to 50 records by the application persistence layer.

## Backup and restore

The Settings page can create a full ThermoShift backup as a JSON file. The backup contains:

- a schema version;
- the export timestamp;
- ThermoShift settings;
- explicitly saved conversion history.

Creating a backup is an explicit local action. ThermoShift does not upload the file. After download, its location, copies, synchronization, and sharing are controlled by the user and operating system/browser.

Restore reads only the file selected by the user. The UI rejects files larger than 256 KiB before calling `File.text()`, and the parser independently enforces the same byte limit before JSON parsing.

For the supported backup schema, ThermoShift validates the export timestamp, complete settings shape, history limit, every conversion record, supported unit IDs, finite values, timestamps, and duplicate conversion identifiers before accepting the backup. Malformed or unsupported backup files are rejected all-or-nothing instead of partially restoring or silently normalizing untrusted imported data.

The selected file is processed locally and is not sent to a ThermoShift server.

The History page also offers a history-only JSON export. Batch conversion offers CSV export. Those files are likewise controlled by the user after download.

## Local diagnostics

ThermoShift may write structured operational diagnostic records to the browser console for events such as engine initialization, browser-storage failure, or service-worker update failure.

These diagnostics are local-only; ThermoShift does not intentionally transmit them to a telemetry/analytics server. Metadata passes through a redaction/bounding layer before console serialization. Credential/session-shaped fields, contact/identity fields, user-content/input/output/value-shaped fields, and raw Error messages are not intentionally serialized as diagnostic payloads.

User-facing startup/update failure messages are generic rather than echoing raw operational error text.

## Data not required by ThermoShift

ThermoShift does not require names, passwords, payment information, contacts, location, advertising identifiers, analytics identifiers, or a cloud account to convert temperatures.

## Clearing data

Individual saved history records can be removed. History can also be cleared from the History screen with an in-app undo opportunity. The Settings screen can reset ThermoShift settings, history, and onboarding state after a confirmation. Browser site settings can also remove local PWA storage and caches.

Resetting browser-managed data cannot delete backup/export files that were already downloaded outside browser storage.

## Network behavior

Core conversion does not require network access. The installed PWA can use cached application assets offline. The Settings update control may ask the registered service worker to check for an application update when the device is online. That update path is separate from conversion and is not used to send conversion/history/backup data to ThermoShift.

External links are opened only after an explicit user action.

## External links

The About/documentation surfaces link to GitHub, email, and Buy Me a Coffee. Opening those services is subject to their own privacy practices.

Questions: `supportramsandesh@gmail.com`.
