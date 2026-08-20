# Performance

ThermoShift keeps the conversion hot path intentionally small: one validated Rust conversion through the cached WebAssembly engine, with no account, database, or network dependency in the calculation path.

## Enforced production asset budgets

The production PWA is measured by `scripts/check-web-budget.mjs` after `apps/web/dist` is built. The checker excludes source maps and measures runtime-oriented HTML, CSS, JavaScript, WebAssembly, manifest, JSON, SVG, PNG, WebP, and icon assets.

Current hard limits are:

- total measured raw assets: **2 MiB** maximum;
- total measured gzip assets: **750 KiB** maximum;
- any single JavaScript asset: **750 KiB raw** maximum;
- any single WebAssembly asset: **512 KiB raw** maximum.

Run:

```bash
npm --workspace @thermoshift/web run build
npm run check:web-budget
```

The checker prints every measured asset from largest to smallest, including raw and gzip sizes, followed by totals. Exceeding any limit exits non-zero so CI and release automation can block an oversized candidate.

## Runtime design constraints

- Conversion must not wait for a network request.
- The WebAssembly engine is initialized once and reused for the page lifetime.
- History remains capped at 50 saved conversions by default, keeping local rendering and persistence bounded.
- Interactive batch conversion rejects input above **32,768 characters** or **1,000 lines** before running the per-line conversion loop, bounding avoidable CPU/DOM work from accidental paste floods.
- Product updates use the PWA service-worker lifecycle and do not sit on the conversion path.
- User-controlled backup input is bounded before parsing so an oversized local file cannot become an accidental memory/CPU hot path.
- Quick Actions and navigation operate on a fixed small action set rather than an unbounded index.

## Measurement policy

Measure before optimizing. Bundle-size changes are automatically measurable through the production budget script. For runtime behavior, use browser performance tooling or platform profiling against a production build when a real regression or expensive workflow is identified.

The temperature formulas themselves are constant-time arithmetic. A synthetic microbenchmark is not currently a release gate because it would mostly measure harness/timer overhead rather than product latency. If profiling later shows meaningful conversion-engine cost, add a stable benchmark with a documented baseline and variance policy rather than an arbitrary timing assertion in unit tests.

The batch ceilings are resource bounds, not benchmark claims. If product requirements later justify larger batches, profile representative production builds first and change the limits together with tests and evidence rather than removing the guard.

## Release evidence

For a release candidate, record:

1. the production build command and commit SHA;
2. the `check:web-budget` output;
3. any intentional budget or batch-bound change with its reason;
4. browser/device profiling evidence when a performance issue motivated the release change.

Budgets and resource bounds must be changed in a reviewable commit and accompanied by documentation explaining why the previous limit is no longer appropriate. Do not raise limits only to make a failing build pass.