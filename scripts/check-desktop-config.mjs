import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tauriDir = resolve(root, 'apps/desktop/src-tauri');
const configPath = resolve(tauriDir, 'tauri.conf.json');
const capabilityPath = resolve(tauriDir, 'capabilities/default.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const capability = JSON.parse(await readFile(capabilityPath, 'utf8'));

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

const windows = capability.windows;
if (!Array.isArray(windows) || windows.length !== 1 || windows[0] !== 'main') {
  throw new Error('Default Tauri capability must be scoped only to the main window.');
}

const permissions = capability.permissions;
if (!Array.isArray(permissions) || permissions.length !== 1 || permissions[0] !== 'core:default') {
  throw new Error(`Default Tauri capability must remain minimal (core:default only); received ${JSON.stringify(permissions)}.`);
}

const csp = config.app?.security?.csp;
if (typeof csp !== 'string' || csp.trim().length === 0) {
  throw new Error('Tauri Content Security Policy is missing.');
}

const directives = new Map(
  csp
    .split(';')
    .map((directive) => directive.trim())
    .filter(Boolean)
    .map((directive) => {
      const [name, ...sources] = directive.split(/\s+/);
      return [name, sources];
    }),
);

const requireSource = (directive, source) => {
  const sources = directives.get(directive);
  if (!sources?.includes(source)) throw new Error(`Tauri CSP ${directive} must include ${source}.`);
};

requireSource('default-src', "'self'");
requireSource('script-src', "'self'");
requireSource('script-src', "'wasm-unsafe-eval'");
requireSource('connect-src', "'self'");
requireSource('connect-src', 'ipc:');
requireSource('connect-src', 'http://ipc.localhost');

for (const [directive, sources] of directives) {
  if (sources.includes('*')) throw new Error(`Tauri CSP ${directive} must not allow wildcard sources.`);
  if (directive === 'script-src' && (sources.includes("'unsafe-inline'") || sources.includes("'unsafe-eval'"))) {
    throw new Error('Tauri CSP script-src must not enable unsafe-inline or general unsafe-eval.');
  }

  for (const source of sources) {
    if (/^https?:$/i.test(source)) {
      throw new Error(`Tauri CSP ${directive} must not allow an entire remote HTTP(S) scheme.`);
    }
    if (/^https?:\/\//i.test(source) && source !== 'http://ipc.localhost') {
      throw new Error(`Tauri CSP ${directive} contains an unexpected remote origin: ${source}`);
    }
  }
}

console.log('Tauri frontend paths, minimal capability, and CSP bounds are consistent.');
