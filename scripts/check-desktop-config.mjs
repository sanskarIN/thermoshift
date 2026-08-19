import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tauriDir = resolve(root, 'apps/desktop/src-tauri');
const configPath = resolve(tauriDir, 'tauri.conf.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));

const expectedWebDir = resolve(root, 'apps/web');
const expectedDist = resolve(expectedWebDir, 'dist');
const configuredDist = resolve(tauriDir, config.build?.frontendDist ?? '');

if (configuredDist !== expectedDist) {
  throw new Error(`Tauri frontendDist resolves to ${configuredDist}; expected ${expectedDist}`);
}

const verifyPrefixCommand = async (name, command) => {
  if (typeof command !== 'string' || command.trim().length === 0) {
    throw new Error(`Tauri ${name} must be a non-empty command.`);
  }

  const match = /(?:^|\s)--prefix\s+(?:"([^"]+)"|'([^']+)'|([^\s]+))/.exec(command);
  const prefix = match?.[1] ?? match?.[2] ?? match?.[3];
  if (!prefix) throw new Error(`Tauri ${name} must use npm --prefix for the web workspace.`);

  const resolvedPrefix = resolve(tauriDir, prefix);
  if (resolvedPrefix !== expectedWebDir) {
    throw new Error(`Tauri ${name} prefix resolves to ${resolvedPrefix}; expected ${expectedWebDir}`);
  }

  await access(resolve(resolvedPrefix, 'package.json'));
};

await verifyPrefixCommand('beforeDevCommand', config.build?.beforeDevCommand);
await verifyPrefixCommand('beforeBuildCommand', config.build?.beforeBuildCommand);

if (config.build?.devUrl !== 'http://localhost:5173') {
  throw new Error(`Unexpected Tauri devUrl: ${String(config.build?.devUrl)}`);
}

if (typeof config.identifier !== 'string' || config.identifier.length === 0) {
  throw new Error('Tauri application identifier is missing.');
}

console.log('Tauri frontend paths and application configuration are consistent.');
