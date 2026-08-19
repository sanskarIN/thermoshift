import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const preflightScript = path.join(scriptDir, 'check-release-inputs.mjs');
const manifestScript = path.join(scriptDir, 'create-release-manifest.mjs');
const candidateSha = 'a'.repeat(40);

const releaseInputs = [
  'package.json',
  'package-lock.json',
  'Cargo.toml',
  'Cargo.lock',
  'apps/web/package.json',
  'apps/desktop/package.json',
  'apps/desktop/src-tauri/Cargo.toml',
  'apps/desktop/src-tauri/tauri.conf.json',
  'apps/desktop/src-tauri/icons/32x32.png',
  'apps/desktop/src-tauri/icons/128x128.png',
  'apps/desktop/src-tauri/icons/128x128@2x.png',
  'apps/desktop/src-tauri/icons/icon.ico',
  'apps/desktop/src-tauri/icons/icon.icns',
  'README.md',
  'CHANGELOG.md',
  'SECURITY.md',
  'PRIVACY.md',
  'docs/release.md',
  'docs/release-evidence.md'
];

const screenshots = [
  'docs/screenshots/onboarding-desktop.png',
  'docs/screenshots/onboarding-mobile.png',
  'docs/screenshots/converter-desktop.png',
  'docs/screenshots/converter-mobile.png',
  'docs/screenshots/settings-desktop.png',
  'docs/screenshots/settings-mobile.png',
  'docs/screenshots/about-desktop.png',
  'docs/screenshots/about-mobile.png'
];

function tempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'thermoshift-release-tools-'));
}

function write(root, relativePath, content = 'fixture') {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function seedReleaseInputs(root, { withScreenshots = false } = {}) {
  for (const file of releaseInputs) {
    write(root, file, file === 'package.json' ? '{"version":"0.2.0"}\n' : `fixture:${file}`);
  }
  if (withScreenshots) {
    for (const file of screenshots) write(root, file, `fixture:${file}`);
  }
}

function writeArchiveAndChecksum(root, archiveContent = 'archive-bytes') {
  write(root, 'artifact.tar.gz', archiveContent);
  const digest = crypto.createHash('sha256').update(archiveContent).digest('hex');
  write(root, 'artifact.tar.gz.sha256', `${digest}  artifact.tar.gz\n`);
}

function manifestCommand(root, extra = {}) {
  return spawnSync(
    process.execPath,
    [manifestScript, '--archive', 'artifact.tar.gz', '--checksum', 'artifact.tar.gz.sha256', '--output', 'manifest.json'],
    {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        THERMOSHIFT_GIT_SHA: candidateSha,
        THERMOSHIFT_GIT_REF: 'v0.2.0',
        ...extra
      }
    }
  );
}

test('release-input preflight accepts a complete base candidate', () => {
  const root = tempRepo();
  seedReleaseInputs(root);
  const result = spawnSync(process.execPath, [preflightScript], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Release-input preflight passed/);
});

test('release-input preflight rejects missing generated evidence', () => {
  const root = tempRepo();
  seedReleaseInputs(root);
  fs.rmSync(path.join(root, 'apps/desktop/src-tauri/icons/icon.ico'));
  const result = spawnSync(process.execPath, [preflightScript], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /icon\.ico/);
});

test('screenshot preflight requires the exact screenshot set', () => {
  const root = tempRepo();
  seedReleaseInputs(root, { withScreenshots: true });
  let result = spawnSync(process.execPath, [preflightScript, '--screenshots'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);

  fs.rmSync(path.join(root, screenshots[0]));
  result = spawnSync(process.execPath, [preflightScript, '--screenshots'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /onboarding-desktop\.png/);
});

test('provenance manifest records candidate identity and SHA-256 digests', () => {
  const root = tempRepo();
  seedReleaseInputs(root, { withScreenshots: true });
  writeArchiveAndChecksum(root);

  const result = manifestCommand(root);
  assert.equal(result.status, 0, result.stderr);

  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.product, 'ThermoShift');
  assert.equal(manifest.version, '0.2.0');
  assert.deepEqual(manifest.git, { sha: candidateSha, ref: 'v0.2.0' });

  const archive = manifest.files.find((entry) => entry.path === 'artifact.tar.gz');
  assert.ok(archive);
  assert.equal(archive.bytes, Buffer.byteLength('archive-bytes'));
  assert.equal(archive.sha256, crypto.createHash('sha256').update('archive-bytes').digest('hex'));
});

test('provenance manifest rejects a mismatched archive checksum', () => {
  const root = tempRepo();
  seedReleaseInputs(root, { withScreenshots: true });
  writeArchiveAndChecksum(root);
  write(root, 'artifact.tar.gz.sha256', `${'0'.repeat(64)}  artifact.tar.gz\n`);

  const result = manifestCommand(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /checksum does not match/);
});

test('provenance manifest requires concrete candidate identity', () => {
  const root = tempRepo();
  seedReleaseInputs(root, { withScreenshots: true });
  writeArchiveAndChecksum(root);

  const env = { ...process.env };
  delete env.GITHUB_SHA;
  delete env.GITHUB_REF_NAME;
  delete env.THERMOSHIFT_GIT_SHA;
  delete env.THERMOSHIFT_GIT_REF;
  const result = spawnSync(
    process.execPath,
    [manifestScript, '--archive', 'artifact.tar.gz', '--checksum', 'artifact.tar.gz.sha256'],
    { cwd: root, encoding: 'utf8', env }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /concrete candidate SHA and ref/);
});

test('provenance manifest rejects malformed candidate SHAs', () => {
  const root = tempRepo();
  seedReleaseInputs(root, { withScreenshots: true });
  writeArchiveAndChecksum(root);

  const result = manifestCommand(root, { THERMOSHIFT_GIT_SHA: 'abc123' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /40- or 64-character hexadecimal Git object ID/);
});

test('provenance manifest rejects malformed candidate refs', () => {
  const root = tempRepo();
  seedReleaseInputs(root, { withScreenshots: true });
  writeArchiveAndChecksum(root);

  const result = manifestCommand(root, { THERMOSHIFT_GIT_REF: 'v0.2.0\nnext' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /single-line Git ref name/);
});

test('provenance manifest rejects output paths outside repository root', () => {
  const root = tempRepo();
  seedReleaseInputs(root, { withScreenshots: true });
  writeArchiveAndChecksum(root);

  const result = spawnSync(
    process.execPath,
    [manifestScript, '--archive', 'artifact.tar.gz', '--checksum', 'artifact.tar.gz.sha256', '--output', '../manifest.json'],
    {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, THERMOSHIFT_GIT_SHA: candidateSha, THERMOSHIFT_GIT_REF: 'v0.2.0' }
    }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /escapes repository root/);
});

test('provenance manifest fails closed when required evidence is missing', () => {
  const root = tempRepo();
  seedReleaseInputs(root, { withScreenshots: true });
  fs.rmSync(path.join(root, 'Cargo.lock'));
  writeArchiveAndChecksum(root);

  const result = manifestCommand(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Cargo\.lock/);
});
