import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) return null;
  return process.argv[index + 1];
}

const root = process.cwd();
const archiveArg = readArg('--archive');
const checksumArg = readArg('--checksum');
const outputArg = readArg('--output') ?? 'thermoshift-release-manifest.json';

if (!archiveArg || !checksumArg) {
  console.error('Usage: node scripts/create-release-manifest.mjs --archive <path> --checksum <path> [--output <path>]');
  process.exit(2);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

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

const normalize = (input) => input.split(path.sep).join('/');

function fileDigest(relativeOrAbsolute) {
  const absolute = path.isAbsolute(relativeOrAbsolute)
    ? relativeOrAbsolute
    : path.join(root, relativeOrAbsolute);
  const data = fs.readFileSync(absolute);
  return {
    path: path.isAbsolute(relativeOrAbsolute)
      ? normalize(path.relative(root, absolute))
      : normalize(relativeOrAbsolute),
    bytes: data.length,
    sha256: crypto.createHash('sha256').update(data).digest('hex')
  };
}

const required = [...evidenceFiles, archiveArg, checksumArg];
const missing = required.filter((file) => {
  const absolute = path.isAbsolute(file) ? file : path.join(root, file);
  return !fs.existsSync(absolute) || !fs.statSync(absolute).isFile() || fs.statSync(absolute).size === 0;
});

if (missing.length) {
  console.error('Cannot create release manifest; required evidence is missing or empty:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const manifest = {
  schemaVersion: 1,
  product: 'ThermoShift',
  version: packageJson.version,
  git: {
    sha: process.env.GITHUB_SHA ?? process.env.THEROMSHIFT_GIT_SHA ?? 'unknown',
    ref: process.env.GITHUB_REF_NAME ?? process.env.THEROMSHIFT_GIT_REF ?? 'unknown'
  },
  generatedAt: new Date().toISOString(),
  files: required.map(fileDigest).sort((a, b) => a.path.localeCompare(b.path))
};

const outputPath = path.isAbsolute(outputArg) ? outputArg : path.join(root, outputArg);
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote release provenance manifest: ${normalize(path.relative(root, outputPath))}`);
