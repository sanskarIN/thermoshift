import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) return null;
  return process.argv[index + 1];
}

const root = path.resolve(process.cwd());
const archiveArg = readArg('--archive');
const checksumArg = readArg('--checksum');
const outputArg = readArg('--output') ?? 'thermoshift-release-manifest.json';

if (!archiveArg || !checksumArg) {
  console.error('Usage: node scripts/create-release-manifest.mjs --archive <path> --checksum <path> [--output <path>]');
  process.exit(2);
}

function resolveInsideRoot(input) {
  const absolute = path.resolve(root, input);
  const relative = path.relative(root, absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path escapes repository root: ${input}`);
  }
  return { absolute, relative: relative.split(path.sep).join('/') };
}

let archive;
let checksum;
let output;
try {
  archive = resolveInsideRoot(archiveArg);
  checksum = resolveInsideRoot(checksumArg);
  output = resolveInsideRoot(outputArg);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const gitSha = process.env.GITHUB_SHA ?? process.env.THERMOSHIFT_GIT_SHA;
const gitRef = process.env.GITHUB_REF_NAME ?? process.env.THERMOSHIFT_GIT_REF;

if (!gitSha || !gitRef) {
  console.error('Release provenance requires a concrete candidate SHA and ref. Set GITHUB_SHA/GITHUB_REF_NAME or THERMOSHIFT_GIT_SHA/THERMOSHIFT_GIT_REF.');
  process.exit(1);
}

const evidenceFiles = [
  'package-lock.json',
  'Cargo.lock',
  'apps/desktop/src-tauri/icons/32x32.png',
  'apps/desktop/src-tauri/icons/128x128.png',
  'apps/desktop/src-tauri/icons/128x128@2x.png',
  'apps/desktop/src-tauri/icons/icon.ico',
  'apps/desktop/src-tauri/icons/icon.icns',
  'docs/screenshots/onboarding-desktop.png',
  'docs/screenshots/onboarding-mobile.png',
  'docs/screenshots/converter-desktop.png',
  'docs/screenshots/converter-mobile.png',
  'docs/screenshots/settings-desktop.png',
  'docs/screenshots/settings-mobile.png',
  'docs/screenshots/about-desktop.png',
  'docs/screenshots/about-mobile.png'
];

function digestFile(relativePath) {
  const absolute = path.join(root, relativePath);
  const data = fs.readFileSync(absolute);
  return {
    path: relativePath,
    bytes: data.length,
    sha256: crypto.createHash('sha256').update(data).digest('hex')
  };
}

const requiredPaths = [...evidenceFiles, archive.relative, checksum.relative];
const missing = requiredPaths.filter((relativePath) => {
  const absolute = path.join(root, relativePath);
  return !fs.existsSync(absolute) || !fs.statSync(absolute).isFile() || fs.statSync(absolute).size === 0;
});

if (missing.length) {
  console.error('Cannot create release manifest; required evidence is missing or empty:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const archiveDigest = digestFile(archive.relative);
const checksumText = fs.readFileSync(checksum.absolute, 'utf8').trim();
const declaredDigest = checksumText.split(/\s+/)[0]?.toLowerCase();
if (!/^[a-f0-9]{64}$/.test(declaredDigest ?? '') || declaredDigest !== archiveDigest.sha256) {
  console.error(`Archive checksum does not match ${archive.relative}.`);
  process.exit(1);
}

const files = requiredPaths.map(digestFile).sort((a, b) => a.path.localeCompare(b.path));
const manifest = {
  schemaVersion: 1,
  product: 'ThermoShift',
  version: packageJson.version,
  git: { sha: gitSha, ref: gitRef },
  generatedAt: new Date().toISOString(),
  files
};

fs.mkdirSync(path.dirname(output.absolute), { recursive: true });
fs.writeFileSync(output.absolute, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote release provenance manifest: ${output.relative}`);
