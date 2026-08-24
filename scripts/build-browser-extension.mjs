import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const extensionRoot = join(repositoryRoot, 'apps', 'extension');
const distRoot = join(extensionRoot, 'dist');
const wasmCrate = join(repositoryRoot, 'crates', 'thermoshift-wasm');
const generatedRoot = join(distRoot, 'generated');

const rootPackage = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(extensionRoot, 'manifest.json'), 'utf8'));

if (manifest.version !== rootPackage.version) {
  throw new Error(`Extension version ${manifest.version} must match workspace version ${rootPackage.version}.`);
}

rmSync(distRoot, { recursive: true, force: true });
mkdirSync(generatedRoot, { recursive: true });

execFileSync(
  'wasm-pack',
  [
    'build',
    '--target',
    'web',
    '--out-dir',
    generatedRoot,
    '--out-name',
    'thermoshift_wasm',
  ],
  { cwd: wasmCrate, stdio: 'inherit' },
);

for (const file of ['manifest.json', 'popup.html', 'popup.css', 'popup.js']) {
  cpSync(join(extensionRoot, file), join(distRoot, file));
}

console.log(`Browser extension built at ${distRoot}`);
