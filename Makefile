.PHONY: setup wasm web test lint check dev

setup:
	npm install
	cargo install wasm-pack --locked

wasm:
	cd crates/thermoshift-wasm && wasm-pack build --target web --out-dir ../../apps/web/src/generated/thermoshift_wasm --out-name thermoshift_wasm

web: wasm
	npm --workspace @thermoshift/web run build:web

test:
	cargo test -p thermoshift-core
	npm --workspace @thermoshift/web run test

lint:
	cargo fmt --all -- --check
	cargo clippy -p thermoshift-core -p thermoshift-wasm --all-targets -- -D warnings
	npm --workspace @thermoshift/web run lint
	npm --workspace @thermoshift/web run typecheck

check: lint test web

dev: wasm
	npm --workspace @thermoshift/web run dev:web
