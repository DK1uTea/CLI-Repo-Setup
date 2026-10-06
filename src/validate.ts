import path from 'node:path';

const RESERVED_NAMES = new Set([
  'node_modules',
  'favicon.ico',
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'timers',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
]);

const NPM_NAME_REGEX = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

export function validateProjectName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Project name cannot be empty.' };
  }

  const trimmed = name.trim();
  if (trimmed !== name) {
    return { valid: false, message: 'Project name cannot have leading or trailing whitespace.' };
  }

  if (name.length > 214) {
    return { valid: false, message: 'Project name cannot exceed 214 characters.' };
  }

  if (name !== name.toLowerCase()) {
    return { valid: false, message: 'Project name must be lowercase.' };
  }

  if (name.startsWith('.') || name.startsWith('_')) {
    return { valid: false, message: 'Project name cannot start with a dot or underscore.' };
  }

  if (RESERVED_NAMES.has(name)) {
    return { valid: false, message: `"${name}" is a reserved system or Node.js module name.` };
  }

  if (!NPM_NAME_REGEX.test(name)) {
    return { valid: false, message: 'Project name must be a valid npm package name (lowercase letters, numbers, hyphens, or @scope/name).' };
  }

  return { valid: true };
}

export function getSanitizedProjectName(name: string): string {
  const parts = name.split('/');
  const baseName = parts[parts.length - 1] ?? name;
  return baseName.replace(/[^a-zA-Z0-9_-]/g, '-');
}

export function resolveTargetDir(
  dirInput: string | undefined,
  projectName: string,
  cwd = process.cwd(),
): { absolutePath: string; isCurrentDir: boolean; displayPath: string } {
  const sanitized = getSanitizedProjectName(projectName);
  const rawPath = dirInput && dirInput.trim() !== '' ? dirInput.trim() : `./${sanitized}`;

  const normalized = rawPath.replace(/[\\/]+$/, '');
  const isCurrentDir = normalized === '.' || normalized === './';

  const absolutePath = isCurrentDir
    ? path.resolve(cwd)
    : path.isAbsolute(normalized)
      ? path.resolve(normalized)
      : path.resolve(cwd, normalized);

  return {
    absolutePath,
    isCurrentDir,
    displayPath: rawPath,
  };
}
