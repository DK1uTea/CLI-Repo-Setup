#!/usr/bin/env node
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { parseCliArgs } from './cli.js';
import { initGit, printNextSteps, runInstall, runUpgradeLatest } from './post.js';
import { resolveConfig } from './prompts.js';
import { scaffoldProject } from './scaffold.js';

async function main() {
  const cliArgs = parseCliArgs(process.argv);
  const config = await resolveConfig(cliArgs);

  const spinner = p.spinner();

  try {
    spinner.start(`Setting up ${pc.cyan(config.projectName)} (${config.projectType.toUpperCase()})...`);

    await scaffoldProject({
      projectType: config.projectType,
      projectName: config.projectName,
      sanitizedProjectName: config.sanitizedProjectName,
      targetDir: config.targetDir,
      existingDirAction: config.existingDirAction,
    });

    spinner.stop(pc.green('✔ Template created at ') + pc.cyan(config.targetDir));

    // Git Init
    if (config.git) {
      spinner.start('Initializing Git repository...');
      const gitRes = await initGit(config.targetDir);
      if (gitRes.success) {
        spinner.stop(pc.green('✔ Git repository initialized'));
      } else {
        spinner.stop(pc.yellow('⚠️  Could not initialize Git repository (run "git init" manually)'));
      }
    }

    // Install Dependencies
    if (config.install) {
      console.log(pc.cyan(`\n📦 Installing dependencies with ${config.packageManager}...`));
      await runInstall(config.targetDir, config.packageManager);
      console.log(pc.green('✔ Dependencies installed successfully!\n'));

      // Latest Upgrade
      if (config.latest) {
        console.log(pc.cyan('🚀 Upgrading dependencies to their latest versions...'));
        const upgradeRes = await runUpgradeLatest(config.targetDir, config.packageManager);
        if (upgradeRes.success) {
          console.log(pc.green('✔ Dependencies upgraded successfully!\n'));
        }
      }
    }

    printNextSteps(config);
    p.outro(pc.green('Project setup complete!'));
  } catch (error) {
    spinner.stop(pc.red('✖ Operation failed'));
    console.error(pc.red('\nAn error occurred during project setup:'));
    if (error instanceof Error) {
      console.error(pc.red(error.message));
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(pc.red('Fatal error:'), err);
  process.exit(1);
});
