import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();

const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));

const readCargoVersion = async (path) => {
  const source = await readFile(resolve(root, path), 'utf8');
  const match = /^version\s*=\s*"([^"]+)"/m.exec(source);
  if (!match?.[1]) throw new Error(`No package version found in ${path}`);
  return match[1];
};

const workspace = await readJson('package.json');
const expected = workspace.version;

if (typeof expected !== 'string' || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(expected)) {
  throw new Error(`Workspace version is not a valid semantic version: ${String(expected)}`);
}

const versions = new Map([
  ['package.json', expected],
  ['apps/web/package.json', (await readJson('apps/web/package.json')).version],
  ['apps/desktop/package.json', (await readJson('apps/desktop/package.json')).version],
  ['apps/desktop/src-tauri/tauri.conf.json', (await readJson('apps/desktop/src-tauri/tauri.conf.json')).version],
  ['crates/thermoshift-core/Cargo.toml', await readCargoVersion('crates/thermoshift-core/Cargo.toml')],
  ['crates/thermoshift-wasm/Cargo.toml', await readCargoVersion('crates/thermoshift-wasm/Cargo.toml')],
  ['apps/desktop/src-tauri/Cargo.toml', await readCargoVersion('apps/desktop/src-tauri/Cargo.toml')],
]);

const mismatches = [...versions].filter(([, version]) => version !== expected);
if (mismatches.length > 0) {
  const details = mismatches.map(([path, version]) => `- ${path}: ${String(version)}`).join('\n');
  throw new Error(`ThermoShift version mismatch. Expected ${expected}:\n${details}`);
}

console.log(`ThermoShift version metadata is consistent at ${expected}.`);
