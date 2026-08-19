# ADR 0003: Use a PWA plus Tauri for delivery

- Status: Accepted
- Date: 2026-08-19

## Context

The product needs web reach, offline installation, and desktop packaging while keeping one presentation codebase.

## Decision

Use React/Vite with a PWA service worker for the browser and Tauri 2 for Windows/macOS/Linux packaging. Keep platform permissions minimal and expose native commands only when they provide clear value.

## Consequences

The frontend is shared across platforms. Desktop releases still require native build prerequisites and platform signing/notarization for trusted distribution.
