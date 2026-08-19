# Security Policy

## Supported versions

Security fixes target the latest released minor version and the current `main` branch.

## Reporting a vulnerability

Prefer GitHub private vulnerability reporting at the repository Security tab. If that is unavailable, email `sanskarin@outlook.in` with the subject `ThermoShift security report`.

Do not open a public issue for an unpatched vulnerability. Include affected version, reproduction conditions, realistic impact, and any suggested remediation. Do not include unrelated private data or credentials.

## Security model

ThermoShift has no required backend or authentication. Conversion happens locally. The desktop application requests only Tauri core permissions required for its main window. Web content is constrained by a Content Security Policy in the desktop configuration. CI runs dependency audits, Dependabot updates, and CodeQL for supported source languages.

Never commit credentials, signing keys, tokens, API keys, private endpoints, or user data. `.env.example` intentionally contains placeholders only.
