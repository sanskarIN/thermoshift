import { readFile } from 'node:fs/promises';

const rootPackage = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const nativePackage = JSON.parse(await readFile(new URL('../apps/desktop/package.json', import.meta.url), 'utf8'));
const tauriConfig = JSON.parse(await readFile(new URL('../apps/desktop/src-tauri/tauri.conf.json', import.meta.url), 'utf8'));
const cargoManifest = await readFile(new URL('../apps/desktop/src-tauri/Cargo.toml', import.meta.url), 'utf8');
const nativeLibrary = await readFile(new URL('../apps/desktop/src-tauri/src/lib.rs', import.meta.url), 'utf8');
const desktopEntry = await readFile(new URL('../apps/desktop/src-tauri/src/main.rs', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(`Native configuration check failed: ${message}`);
}

function hasScript(pkg, script) {
  return typeof pkg.scripts?.[script] === 'string' && pkg.scripts[script].length > 0;
}

assert(tauriConfig.identifier === 'in.sanskar.thermoshift', 'the application identifier must remain stable');
assert(tauriConfig.bundle?.android?.minSdkVersion >= 24, 'Android minSdkVersion must be at least Tauri’s supported API 24 baseline');
assert(Number.parseFloat(tauriConfig.bundle?.iOS?.minimumSystemVersion ?? '0') >= 14, 'iOS minimum system version must be 14.0 or newer');

for (const script of ['android:init', 'android:dev', 'android:build', 'android:apk', 'android:aab', 'ios:init', 'ios:dev', 'ios:build']) {
  assert(hasScript(nativePackage, script), `apps/desktop/package.json is missing ${script}`);
  assert(hasScript(rootPackage, script), `package.json is missing ${script}`);
}

assert(/\[lib\]/u.test(cargoManifest), 'Cargo.toml must define a library target for mobile');
for (const crateType of ['staticlib', 'cdylib', 'rlib']) {
  assert(cargoManifest.includes(`"${crateType}"`), `Cargo.toml library crate-type is missing ${crateType}`);
}

assert(nativeLibrary.includes('#[cfg_attr(mobile, tauri::mobile_entry_point)]'), 'lib.rs must expose Tauri’s mobile entry point');
assert(nativeLibrary.includes('pub fn run()'), 'lib.rs must expose a shared run function');
assert(desktopEntry.includes('thermoshift_lib::run();'), 'desktop main.rs must delegate to the shared native library');

console.log('Native configuration verified: desktop, Android, and iOS invariants are present.');
