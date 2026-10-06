import path from 'node:path';

const COMMON_EXCLUDES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.next',
  '.env',
  '.env.local',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  'bun.lockb',
  'coverage',
  '.DS_Store',
  'Thumbs.db',
];

export function shouldExclude(srcPath, relPath, isFE) {
  const parts = relPath.split(/[\\/]/);
  const base = path.basename(srcPath);

  for (const part of parts) {
    if (COMMON_EXCLUDES.includes(part)) return true;
    if (part === '.husky' && parts.includes('_')) return true;
    if (part === '.omc' && (parts.includes('sessions') || parts.includes('state'))) return true;
  }

  if (base.endsWith('.tsbuildinfo')) return true;
  if (base.startsWith('.env.') && base.endsWith('.local')) return true;
  if (base === '.env') return true;

  if (isFE) {
    if (parts.includes('.playwright-mcp')) return true;
    if (parts.includes('.playwright-cli')) return true;
    if (parts.includes('playwright-report')) return true;
    if (parts.includes('test-results')) return true;
    if (parts.includes('src') && parts.includes('.omc')) return true;
    if (parts.includes('.omc')) return true;
    if (parts.includes('.vscode') && base !== 'mcp.json') return true;
  }

  return false;
}
