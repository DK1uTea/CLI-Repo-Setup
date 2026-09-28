import type { PackageManager } from './types.js';

export function detectPackageManager(userAgent = process.env.npm_config_user_agent): PackageManager {
  if (!userAgent) return 'pnpm';

  if (userAgent.startsWith('pnpm')) return 'pnpm';
  if (userAgent.startsWith('bun')) return 'bun';
  if (userAgent.startsWith('yarn')) return 'yarn';
  if (userAgent.startsWith('npm')) return 'npm';

  return 'pnpm';
}

export function getInstallArgs(pm: PackageManager): { cmd: string; args: string[] } {
  return { cmd: pm, args: ['install'] };
}

export function getUpgradeArgs(pm: PackageManager): { cmd: string; args: string[] }[] {
  switch (pm) {
    case 'pnpm':
      return [{ cmd: 'pnpm', args: ['up', '--latest'] }];
    case 'bun':
      return [{ cmd: 'bun', args: ['update'] }];
    case 'yarn':
      return [{ cmd: 'yarn', args: ['up'] }];
    case 'npm':
      return [
        { cmd: 'npx', args: ['-y', 'npm-check-updates', '-u'] },
        { cmd: 'npm', args: ['install'] },
      ];
  }
}

export function getRunScriptCommand(pm: PackageManager, script: string): string {
  switch (pm) {
    case 'pnpm':
      return `pnpm ${script}`;
    case 'npm':
      return `npm run ${script}`;
    case 'yarn':
      return `yarn ${script}`;
    case 'bun':
      return `bun run ${script}`;
  }
}
