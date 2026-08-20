import { gzipSync } from 'node:zlib';
import { readdir, readFile } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'apps/web/dist');

const BUDGET = {
  totalRaw: 2 * 1024 * 1024,
  totalGzip: 750 * 1024,
  maxJavaScriptRaw: 750 * 1024,
  maxWasmRaw: 512 * 1024,
};

const measuredExtensions = new Set([
  '.css', '.html', '.ico', '.js', '.json', '.png', '.svg', '.webmanifest', '.wasm', '.webp',
]);

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path));
    else paths.push(path);
  }
  return paths;
};

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;
const failures = [];
let totalRaw = 0;
let totalGzip = 0;
const rows = [];

for (const path of await walk(dist)) {
  const extension = extname(path).toLowerCase();
  if (path.endsWith('.map') || !measuredExtensions.has(extension)) continue;

  const contents = await readFile(path);
  const raw = contents.byteLength;
  const gzip = gzipSync(contents, { level: 9 }).byteLength;
  const name = relative(dist, path).replaceAll('\\', '/');
  totalRaw += raw;
  totalGzip += gzip;
  rows.push({ name, raw, gzip });

  if (extension === '.js' && raw > BUDGET.maxJavaScriptRaw) {
    failures.push(`${name} JavaScript size ${formatBytes(raw)} exceeds ${formatBytes(BUDGET.maxJavaScriptRaw)}`);
  }
  if (extension === '.wasm' && raw > BUDGET.maxWasmRaw) {
    failures.push(`${name} WASM size ${formatBytes(raw)} exceeds ${formatBytes(BUDGET.maxWasmRaw)}`);
  }
}

rows.sort((left, right) => right.raw - left.raw);
console.log('ThermoShift production asset budget:');
for (const row of rows) console.log(`- ${row.name}: ${formatBytes(row.raw)} raw / ${formatBytes(row.gzip)} gzip`);
console.log(`Total: ${formatBytes(totalRaw)} raw / ${formatBytes(totalGzip)} gzip`);

if (totalRaw > BUDGET.totalRaw) failures.push(`total raw size ${formatBytes(totalRaw)} exceeds ${formatBytes(BUDGET.totalRaw)}`);
if (totalGzip > BUDGET.totalGzip) failures.push(`total gzip size ${formatBytes(totalGzip)} exceeds ${formatBytes(BUDGET.totalGzip)}`);

if (failures.length > 0) {
  console.error('Performance budget failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Performance budget passed.');
}
