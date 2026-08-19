.PHONY: setup wasm web test lint metadata budget e2e screenshots desktop-check check dev

setup:
	npm install --ignore-scripts
	cargo install wasm-pack --locked

wasm:
	cd crates/thermoshift-wasm && wasm-pack build --target web --out-dir ../../apps/web/src/generated/thermoshift_wasm --out-name thermoshift_wasm

metadata:
	npm run check:versions
	npm run check:desktop-config
	npm run check:docs

web: wasm
	npm --workspace @thermoshift/web run build:web

budget: web
	npm run check:web-budget

test:
	cargo test -p thermoshift-core
	npm --workspace @thermoshift/web run test

lint:
	cargo fmt --all -- --check
	cargo clippy -p thermoshift-core -p thermoshift-wasm --all-targets -- -D warnings
	npm --workspace @thermoshift/web run lint
	npm --workspace @thermoshift/web run typecheck

e2e: web
	npm --workspace @thermoshift/web run e2e

screenshots: web
	npm --workspace @thermoshift/web run screenshots
	npm run check:screenshots

desktop-check:
	cargo check -p thermoshift-desktop

check: metadata lint test budget

dev: wasm
	npm --workspace @thermoshift/web run dev:web
