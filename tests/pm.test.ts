import { describe, expect, it } from 'vitest';
import {
  detectPackageManager,
  getInstallArgs,
  getRunScriptCommand,
  getUpgradeArgs,
} from '../src/pm.js';

describe('detectPackageManager', () => {
  it('detects pnpm from user agent', () => {
    expect(detectPackageManager('pnpm/10.33.0 npm/? node/v24.14.1 win32 x64')).toBe('pnpm');
  });

  it('detects npm from user agent', () => {
    expect(detectPackageManager('npm/11.11.0 node/v24.14.1 win32 x64')).toBe('npm');
  });

  it('detects yarn from user agent', () => {
    expect(detectPackageManager('yarn/1.22.19 npm/? node/v24.14.1 win32 x64')).toBe('yarn');
  });

  it('detects bun from user agent', () => {
    expect(detectPackageManager('bun/1.1.20 node/v24.14.1 win32 x64')).toBe('bun');
  });

  it('falls back to pnpm when user agent is missing or unknown', () => {
    expect(detectPackageManager(undefined)).toBe('pnpm');
    expect(detectPackageManager('')).toBe('pnpm');
    expect(detectPackageManager('unknown-pm/1.0')).toBe('pnpm');
  });
});

describe('package manager commands', () => {
  it('builds install args for each pm', () => {
    expect(getInstallArgs('pnpm')).toEqual({ cmd: 'pnpm', args: ['install'] });
    expect(getInstallArgs('npm')).toEqual({ cmd: 'npm', args: ['install'] });
    expect(getInstallArgs('yarn')).toEqual({ cmd: 'yarn', args: ['install'] });
    expect(getInstallArgs('bun')).toEqual({ cmd: 'bun', args: ['install'] });
  });

  it('builds upgrade args for pnpm and bun', () => {
    expect(getUpgradeArgs('pnpm')).toEqual([{ cmd: 'pnpm', args: ['up', '--latest'] }]);
    expect(getUpgradeArgs('bun')).toEqual([{ cmd: 'bun', args: ['update'] }]);
  });

  it('builds upgrade args for npm using npm-check-updates and install', () => {
    const npmUpgrade = getUpgradeArgs('npm');
    expect(npmUpgrade.length).toBe(2);
    expect(npmUpgrade[0]).toEqual({ cmd: 'npx', args: ['-y', 'npm-check-updates', '-u'] });
    expect(npmUpgrade[1]).toEqual({ cmd: 'npm', args: ['install'] });
  });

  it('generates correct script runner command', () => {
    expect(getRunScriptCommand('pnpm', 'dev')).toBe('pnpm dev');
    expect(getRunScriptCommand('npm', 'dev')).toBe('npm run dev');
    expect(getRunScriptCommand('yarn', 'dev')).toBe('yarn dev');
    expect(getRunScriptCommand('bun', 'dev')).toBe('bun run dev');
  });
});
