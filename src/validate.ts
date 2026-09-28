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
    return { valid: false, message: 'Tên project không được để trống.' };
  }

  const trimmed = name.trim();
  if (trimmed !== name) {
    return { valid: false, message: 'Tên project không được chứa khoảng trắng ở đầu hoặc cuối.' };
  }

  if (name.length > 214) {
    return { valid: false, message: 'Tên project không được vượt quá 214 ký tự.' };
  }

  if (name !== name.toLowerCase()) {
    return { valid: false, message: 'Tên project phải viết thường hoàn toàn (lowercase).' };
  }

  if (name.startsWith('.') || name.startsWith('_')) {
    return { valid: false, message: 'Tên project không được bắt đầu bằng dấu chấm hoặc gạch dưới.' };
  }

  if (RESERVED_NAMES.has(name)) {
    return { valid: false, message: `"${name}" là từ khóa hệ thống hoặc tên module Node.js đã được bảo lưu.` };
  }

  if (!NPM_NAME_REGEX.test(name)) {
    return { valid: false, message: 'Tên project không đúng định dạng npm package name (chỉ gồm a-z, 0-9, dấu gạch nối, hoặc @scope/name).' };
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
