import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ignoredDirectories = new Set(['.git', 'node_modules', 'target', 'dist', 'coverage', 'playwright-report', 'test-results']);
const markdownFiles = [];

const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.isFile() && entry.name.endsWith('.md')) markdownFiles.push(absolute);
  }
};

const stripTargetDecoration = (raw) => {
  let target = raw.trim();
  if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1).trim();
  const titleMatch = target.match(/^(\S+)(?:\s+["'][^"']*["'])$/);
  if (titleMatch) target = titleMatch[1];
  return target;
};

const isExternal = (target) =>
  /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target) || target.startsWith('#');

const failures = [];
walk(root);

for (const file of markdownFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const relativeSource = path.relative(root, file);
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;

  for (const match of source.matchAll(linkPattern)) {
    const rawTarget = stripTargetDecoration(match[1]);
    if (!rawTarget || isExternal(rawTarget)) continue;

    const withoutFragment = rawTarget.split('#', 1)[0].split('?', 1)[0];
    if (!withoutFragment) continue;

    let decoded;
    try {
      decoded = decodeURIComponent(withoutFragment);
    } catch {
      failures.push(`${relativeSource}: invalid URL encoding in ${rawTarget}`);
      continue;
    }

    const resolved = path.resolve(path.dirname(file), decoded);
    const relativeResolved = path.relative(root, resolved);
    if (relativeResolved.startsWith('..') || path.isAbsolute(relativeResolved) && relativeResolved !== '') {
      failures.push(`${relativeSource}: link escapes repository: ${rawTarget}`);
      continue;
    }
    if (!fs.existsSync(resolved)) failures.push(`${relativeSource}: missing target ${rawTarget}`);
  }
}

if (failures.length > 0) {
  console.error('Documentation link verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Verified internal Markdown links across ${markdownFiles.length} files.`);
