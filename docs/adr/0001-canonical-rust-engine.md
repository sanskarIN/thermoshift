# ADR 0001: Use one canonical Rust conversion engine

- Status: Accepted
- Date: 2026-08-19

## Context

ThermoShift targets both browsers and Tauri desktop. Implementing conversion formulas independently in Rust and TypeScript creates drift risk, especially around historic scales and absolute-zero validation.

## Decision

All executable conversion and physical validation logic lives in the dependency-free `thermoshift-core` Rust crate. Browsers call it through a `wasm-bindgen` adapter. Tauri links the crate directly.

## Consequences

The web toolchain requires `wasm-pack`, but conversion correctness has one source of truth and one primary test suite. UI-only educational formulas may remain in TypeScript as explanatory copy.
