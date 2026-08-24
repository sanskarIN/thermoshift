import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const extensionRoot = join(repositoryRoot, 'apps', 'extension');
const rootPackage = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(extensionRoot, 'manifest.json'), 'utf8'));
const popupHtml = readFileSync(join(extensionRoot, 'popup.html'), 'utf8');
const popupJavaScript = readFileSync(join(extensionRoot, 'popup.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(manifest.manifest_version === 3, 'Browser extension must use Manifest V3.');
assert(manifest.version === rootPackage.version, 'Browser extension version must match the workspace version.');
assert(manifest.action?.default_popup === 'popup.html', 'Browser extension action must open popup.html.');
assert(!manifest.permissions || manifest.permissions.length === 0, 'Browser extension foundation must not request permissions.');
assert(!manifest.host_permissions || manifest.host_permissions.length === 0, 'Browser extension foundation must not request host permissions.');
assert(
  manifest.content_security_policy?.extension_pages?.includes("'wasm-unsafe-eval'"),
  'Extension CSP must explicitly allow local WebAssembly execution.',
);
assert(
  !/https?:\/\//i.test(manifest.content_security_policy?.extension_pages ?? ''),
  'Extension CSP must not allow remote script origins.',
);
assert(!/<script(?![^>]*\bsrc=)/i.test(popupHtml), 'Extension popup must not contain inline scripts.');
assert(
  popupJavaScript.includes("./generated/thermoshift_wasm.js"),
  'Extension popup must use the generated canonical Rust/WASM engine.',
);

console.log('Browser extension configuration invariants verified.');
