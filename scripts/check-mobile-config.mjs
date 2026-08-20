import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tauriDir = resolve(root, 'apps/desktop/src-tauri');

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

const rootPackage = await readJson(resolve(root, 'package.json'));
const desktopPackage = await readJson(resolve(root, 'apps/desktop/package.json'));
const baseConfig = await readJson(resolve(tauriDir, 'tauri.conf.json'));
const androidConfig = await readJson(resolve(tauriDir, 'tauri.android.conf.json'));
const iosConfig = await readJson(resolve(tauriDir, 'tauri.ios.conf.json'));
const cargoManifest = await readFile(resolve(tauriDir, 'Cargo.toml'), 'utf8');
const librarySource = await readFile(resolve(tauriDir, 'src/lib.rs'), 'utf8');
const binarySource = await readFile(resolve(tauriDir, 'src/main.rs'), 'utf8');
const viteConfig = await readFile(resolve(root, 'apps/web/vite.config.ts'), 'utf8');

if (desktopPackage.scripts?.tauri !== 'tauri') {
  throw new Error(`Native package must expose the plain Tauri CLI script required by generated mobile projects; received ${String(desktopPackage.scripts?.tauri)}.`);
}

const requiredDesktopScripts = new Map([
  ['android:init', 'tauri android init --ci'],
  ['android:dev', 'tauri android dev'],
  ['android:dev:host', 'tauri android dev --host'],
  ['android:build', 'tauri android build --ci --apk --aab'],
  ['android:run', 'tauri android run'],
  ['ios:init', 'tauri ios init --ci'],
  ['ios:dev', 'tauri ios dev'],
  ['ios:dev:host', 'tauri ios dev --host'],
  ['ios:dev:tunnel', 'tauri ios dev --force-ip-prompt'],
  ['ios:build', 'tauri ios build --ci'],
  ['ios:build:simulator', 'tauri ios build --ci --target aarch64-sim'],
  ['ios:run', 'tauri ios run'],
]);

for (const [name, command] of requiredDesktopScripts) {
  if (desktopPackage.scripts?.[name] !== command) {
    throw new Error(`Unexpected @thermoshift/desktop ${name} script: ${String(desktopPackage.scripts?.[name])}`);
  }
}

for (const name of requiredDesktopScripts.keys()) {
  const expected = `npm --workspace @thermoshift/desktop run ${name}`;
  if (rootPackage.scripts?.[name] !== expected) {
    throw new Error(`Unexpected workspace ${name} script: ${String(rootPackage.scripts?.[name])}`);
  }
}

if (rootPackage.scripts?.['check:mobile-config'] !== 'node scripts/check-mobile-config.mjs') {
  throw new Error('Workspace check:mobile-config script is missing or unexpected.');
}

if (baseConfig.identifier !== 'in.sanskar.thermoshift') {
  throw new Error(`Unexpected Tauri mobile application identifier: ${String(baseConfig.identifier)}`);
}

if (androidConfig.bundle?.android?.minSdkVersion !== 24) {
  throw new Error(`Android minSdkVersion must remain 24; received ${String(androidConfig.bundle?.android?.minSdkVersion)}`);
}

if (iosConfig.bundle?.iOS?.minimumSystemVersion !== '14.0') {
  throw new Error(`iOS minimumSystemVersion must remain 14.0; received ${String(iosConfig.bundle?.iOS?.minimumSystemVersion)}`);
}

if (Object.hasOwn(iosConfig.bundle?.iOS ?? {}, 'developmentTeam')) {
  throw new Error('Do not commit an Apple development team identifier; supply APPLE_DEVELOPMENT_TEAM at build time.');
}

if (!/^\[lib\][\s\S]*?name\s*=\s*"thermoshift_lib"/m.test(cargoManifest)) {
  throw new Error('Tauri Cargo manifest must expose the thermoshift_lib library target.');
}

const crateTypes = cargoManifest.match(/crate-type\s*=\s*\[([^\]]+)\]/m)?.[1] ?? '';
for (const requiredType of ['staticlib', 'cdylib', 'rlib']) {
  if (!crateTypes.includes(`"${requiredType}"`)) {
    throw new Error(`Tauri library crate-type is missing ${requiredType}.`);
  }
}

if (!librarySource.includes('#[cfg_attr(mobile, tauri::mobile_entry_point)]')) {
  throw new Error('Shared Tauri runtime must retain the mobile_entry_point attribute.');
}

if (!/pub\s+fn\s+run\s*\(/.test(librarySource)) {
  throw new Error('Shared Tauri runtime must expose pub fn run().');
}

if (!binarySource.includes('thermoshift_lib::run();')) {
  throw new Error('Desktop binary must delegate to the shared Tauri runtime.');
}

const requiredViteFragments = [
  'process.env.TAURI_DEV_HOST',
  'host: tauriDevHost || false',
  'port: 5173',
  'strictPort: true',
  "protocol: 'ws'",
  'host: tauriDevHost',
];

for (const fragment of requiredViteFragments) {
  if (!viteConfig.includes(fragment)) {
    throw new Error(`Vite mobile development-server configuration is missing: ${fragment}`);
  }
}

console.log('Android/iOS commands, generated-project Tauri CLI bridge, device-host development, platform configs, and shared Tauri mobile runtime are consistent.');
