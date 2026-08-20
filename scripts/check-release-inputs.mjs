import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requireScreenshots = process.argv.includes('--screenshots');

const requiredFiles = [
  'package.json',
  'package-lock.json',
  'Cargo.toml',
  'Cargo.lock',
  'apps/web/package.json',
  'apps/web/index.html',
  'apps/web/src/styles.css',
  'apps/desktop/package.json',
  'apps/desktop/src-tauri/Cargo.toml',
  'apps/desktop/src-tauri/tauri.conf.json',
  'apps/desktop/src-tauri/tauri.android.conf.json',
  'apps/desktop/src-tauri/tauri.ios.conf.json',
  'apps/desktop/src-tauri/src/lib.rs',
  'apps/desktop/src-tauri/icons/32x32.png',
  'apps/desktop/src-tauri/icons/128x128.png',
  'apps/desktop/src-tauri/icons/128x128@2x.png',
  'apps/desktop/src-tauri/icons/icon.ico',
  'apps/desktop/src-tauri/icons/icon.icns',
  'scripts/check-desktop-config.mjs',
  'scripts/check-mobile-config.mjs',
  '.github/workflows/desktop-platforms.yml',
  '.github/workflows/mobile-platforms.yml',
  'README.md',
  'CHANGELOG.md',
  'SECURITY.md',
  'PRIVACY.md',
  'docs/mobile.md',
  'docs/release.md',
  'docs/release-evidence.md'
];

const screenshotFiles = [
  'docs/screenshots/onboarding-desktop.png',
  'docs/screenshots/onboarding-mobile.png',
  'docs/screenshots/converter-desktop.png',
  'docs/screenshots/converter-mobile.png',
  'docs/screenshots/settings-desktop.png',
  'docs/screenshots/settings-mobile.png',
  'docs/screenshots/about-desktop.png',
  'docs/screenshots/about-mobile.png'
];

const missing = [];
const empty = [];

for (const relativePath of [...requiredFiles, ...(requireScreenshots ? screenshotFiles : [])]) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    missing.push(relativePath);
    continue;
  }

  const stat = fs.statSync(absolutePath);
  if (!stat.isFile() || stat.size === 0) {
    empty.push(relativePath);
  }
}

if (missing.length || empty.length) {
  console.error('ThermoShift release-input preflight failed.');
  if (missing.length) {
    console.error('\nMissing required files:');
    for (const file of missing) console.error(`- ${file}`);
  }
  if (empty.length) {
    console.error('\nEmpty/non-file required paths:');
    for (const file of empty) console.error(`- ${file}`);
  }
  console.error('\nGenerate missing evidence with the documented native workflows; do not create placeholder files.');
  process.exit(1);
}

console.log(`Release-input preflight passed${requireScreenshots ? ' with screenshot evidence' : ''}.`);
