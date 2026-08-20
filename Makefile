.PHONY: setup wasm web test lint metadata release-preflight release-preflight-screenshots budget e2e e2e-cross-browser screenshots desktop-check mobile-check android-init android-dev android-build ios-init ios-dev ios-build-simulator check dev

setup:
	npm ci --ignore-scripts
	cargo install wasm-pack --locked

wasm:
	cd crates/thermoshift-wasm && wasm-pack build --target web --out-dir ../../apps/web/src/generated/thermoshift_wasm --out-name thermoshift_wasm

metadata:
	npm run check:versions
	npm run check:desktop-config
	npm run check:mobile-config
	npm run check:docs

release-preflight:
	npm run check:release-inputs

release-preflight-screenshots:
	npm run check:release-inputs:screenshots

web: wasm
	npm --workspace @thermoshift/web run build:web

budget: web
	npm run check:web-budget

test:
	cargo test --locked -p thermoshift-core
	npm --workspace @thermoshift/web run test

lint:
	cargo fmt --all -- --check
	cargo clippy --locked -p thermoshift-core -p thermoshift-wasm --all-targets -- -D warnings
	npm --workspace @thermoshift/web run lint
	npm --workspace @thermoshift/web run typecheck

e2e: web
	npm --workspace @thermoshift/web run e2e

e2e-cross-browser: web
	npm --workspace @thermoshift/web run e2e:cross-browser

screenshots: web
	npm --workspace @thermoshift/web run screenshots
	npm run check:screenshots

desktop-check:
	npm run check:desktop-config
	cargo check --locked -p thermoshift-desktop

mobile-check:
	npm run check:mobile-config

android-init: mobile-check
	npm run android:init

android-dev: mobile-check
	npm run android:dev

android-build: mobile-check
	npm run android:build

ios-init: mobile-check
	npm run ios:init

ios-dev: mobile-check
	npm run ios:dev

ios-build-simulator: mobile-check
	npm run ios:build:simulator

check: metadata lint test budget

dev: wasm
	npm --workspace @thermoshift/web run dev:web
