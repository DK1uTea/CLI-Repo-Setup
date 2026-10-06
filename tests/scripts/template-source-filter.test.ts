import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { shouldExclude } from '../../scripts/template-source-filter.mjs';

describe('template source filtering', () => {
  it('keeps application source and example environment files', () => {
    expect(shouldExclude(path.join('repo', 'src', 'main.ts'), path.join('src', 'main.ts'), true)).toBe(false);
    expect(shouldExclude(path.join('repo', '.env.example'), '.env.example', false)).toBe(false);
  });

  it('excludes installed dependencies, lockfiles, and private environment files', () => {
    expect(shouldExclude(path.join('repo', 'node_modules', 'lib'), path.join('node_modules', 'lib'), true)).toBe(true);
    expect(shouldExclude(path.join('repo', 'pnpm-lock.yaml'), 'pnpm-lock.yaml', false)).toBe(true);
    expect(shouldExclude(path.join('repo', '.env'), '.env', false)).toBe(true);
    expect(shouldExclude(path.join('repo', '.env.local'), '.env.local', true)).toBe(true);
  });

  it('filters FE-only editor and browser artifacts while keeping MCP settings', () => {
    const settings = path.join('.vscode', 'settings.json');
    const mcp = path.join('.vscode', 'mcp.json');
    expect(shouldExclude(path.join('repo', settings), settings, true)).toBe(true);
    expect(shouldExclude(path.join('repo', mcp), mcp, true)).toBe(false);
    expect(shouldExclude(path.join('repo', settings), settings, false)).toBe(false);
    expect(shouldExclude(path.join('repo', 'playwright-report'), 'playwright-report', true)).toBe(true);
  });
});
