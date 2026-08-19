# Performance

ThermoShift's hot path is intentionally tiny: a single validated Rust conversion with no network or database dependency.

## Budgets

For the first stable release:

- primary interaction should update perceptibly within one animation frame on ordinary desktop hardware;
- avoid blocking network requests during conversion;
- keep first-party application assets compact enough for reliable offline caching;
- keep saved history capped at 50 records by default;
- avoid repeated WASM initialization by caching one engine instance per page load.

## Measurement

Production build size should be recorded during release verification. Add focused Rust benchmarks only if profiling identifies conversion work as meaningful; current formulas are constant-time arithmetic and premature microbenchmarking would not guide product decisions.
