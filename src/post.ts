import fs from 'fs-extra';
import path from 'node:path';
import { execa } from 'execa';
import pc from 'picocolors';
import { getInstallArgs, getRunScriptCommand, getUpgradeArgs } from './pm.js';
import type { PackageManager, ResolvedConfig } from './types.js';

export async function initGit(targetDir: string): Promise<{ success: boolean; committed: boolean }> {
  try {
    await execa('git', ['init'], { cwd: targetDir });
    try {
      await execa('git', ['add', '-A'], { cwd: targetDir });
      await execa('git', ['commit', '-m', 'chore: initial scaffold from create-my-stack'], {
        cwd: targetDir,
      });
      return { success: true, committed: true };
    } catch {
      // Git commit might fail if user.name or user.email is not set in git config
      return { success: true, committed: false };
    }
  } catch {
    return { success: false, committed: false };
  }
}

export async function runInstall(targetDir: string, pm: PackageManager): Promise<void> {
  const { cmd, args } = getInstallArgs(pm);
  await execa(cmd, args, {
    cwd: targetDir,
    stdio: 'inherit',
    env: { ...process.env, HUSKY: '0' },
  });
}

export async function runUpgradeLatest(
  targetDir: string,
  pm: PackageManager,
): Promise<{ success: boolean; fallbackOccurred: boolean }> {
  const pkgPath = path.join(targetDir, 'package.json');
  const pkgBackup = await fs.readFile(pkgPath, 'utf8');

  const upgradeCommands = getUpgradeArgs(pm);

  try {
    for (const { cmd, args } of upgradeCommands) {
      await execa(cmd, args, {
        cwd: targetDir,
        stdio: 'inherit',
        env: { ...process.env, HUSKY: '0' },
      });
    }
    return { success: true, fallbackOccurred: false };
  } catch {
    console.warn(
      pc.yellow(
        '\n⚠️  Dependency upgrade failed (possibly due to version or peer dependency conflicts).',
      ),
    );
    console.warn(
      pc.yellow('⚠️  Restoring template dependency versions and retrying installation...\n'),
    );

    // Restore package.json
    await fs.writeFile(pkgPath, pkgBackup, 'utf8');

    // Re-run install with original dependencies
    try {
      await runInstall(targetDir, pm);
    } catch (installErr) {
      console.error(pc.red('❌ Failed to restore and install template dependencies:'), installErr);
    }

    return { success: false, fallbackOccurred: true };
  }
}

export function printNextSteps(config: ResolvedConfig): void {
  const { isCurrentDir, displayTargetDir, packageManager, install, projectType } = config;

  console.log(pc.green('\n✔ Project created at ') + pc.cyan(config.targetDir));
  console.log(pc.bold('\n👉 Next steps:'));

  const steps: string[] = [];

  if (!isCurrentDir) {
    steps.push(`cd ${displayTargetDir}`);
  }

  if (!install) {
    steps.push(getInstallArgs(packageManager).cmd + ' install');
  }

  if (projectType === 'fe') {
    steps.push(`${getRunScriptCommand(packageManager, 'dev')}         # Start the Next.js development server`);
    steps.push(`${getRunScriptCommand(packageManager, 'test')}        # Run Vitest unit tests`);
    steps.push(`${getRunScriptCommand(packageManager, 'test:e2e')}    # Run Playwright E2E tests`);
  } else {
    steps.push('docker-compose up -d                  # Start TimescaleDB and Redis');
    steps.push(`${getRunScriptCommand(packageManager, 'prisma:generate')}  # Generate the Prisma client`);
    steps.push(`${getRunScriptCommand(packageManager, 'dev:api')}         # Start the NestJS REST API in development mode`);
    steps.push(`${getRunScriptCommand(packageManager, 'test')}            # Run Jest unit tests`);
  }

  steps.forEach((step, idx) => {
    console.log(`  ${pc.gray(`${idx + 1}.`)} ${pc.cyan(step)}`);
  });

  console.log(pc.dim('\nHappy coding! 🚀\n'));
}
