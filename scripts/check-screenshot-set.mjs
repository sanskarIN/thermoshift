import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const screenshotDir = path.join(root, 'docs', 'screenshots');
const surfaces = ['onboarding', 'converter', 'settings', 'about'];
const projects = ['desktop', 'mobile'];
const expected = surfaces.flatMap((surface) => projects.map((project) => `${surface}-${project}.png`));
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const fail = (message) => {
  console.error(`Screenshot verification failed: ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(screenshotDir)) {
  fail(`missing ${path.relative(root, screenshotDir)}`);
} else {
  const actual = fs.readdirSync(screenshotDir).filter((file) => file.endsWith('.png')).sort();
  const missing = expected.filter((file) => !actual.includes(file));
  const unexpected = actual.filter((file) => !expected.includes(file));

  if (missing.length > 0) fail(`missing files: ${missing.join(', ')}`);
  if (unexpected.length > 0) fail(`unexpected PNG files: ${unexpected.join(', ')}`);

  for (const file of expected) {
    const filePath = path.join(screenshotDir, file);
    if (!fs.existsSync(filePath)) continue;

    const bytes = fs.readFileSync(filePath);
    if (bytes.length < 10_000) {
      fail(`${file} is unexpectedly small (${bytes.length} bytes)`);
      continue;
    }
    if (bytes.length < 24 || !bytes.subarray(0, 8).equals(pngSignature)) {
      fail(`${file} is not a valid PNG header`);
      continue;
    }

    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    const isDesktop = file.endsWith('-desktop.png');

    if (isDesktop) {
      if (width < 1200 || height < 700) fail(`${file} has unexpected desktop dimensions ${width}×${height}`);
    } else if (width < 360 || width > 600 || height < 700) {
      fail(`${file} has unexpected mobile dimensions ${width}×${height}`);
    }
  }
}

if (!process.exitCode) {
  console.log(`Verified ${expected.length} ThermoShift product screenshots.`);
}
