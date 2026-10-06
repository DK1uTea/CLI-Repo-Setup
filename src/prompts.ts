import * as p from '@clack/prompts';
import fs from 'fs-extra';
import pc from 'picocolors';
import { detectPackageManager } from './pm.js';
import { isDirectoryEmpty } from './scaffold.js';
import type {
  CliArgs,
  ExistingDirAction,
  PackageManager,
  ProjectType,
  ResolvedConfig,
} from './types.js';
import {
  getSanitizedProjectName,
  resolveTargetDir,
  validateProjectName,
} from './validate.js';

function handleCancel(value: unknown): void {
  if (p.isCancel(value)) {
    p.cancel('Operation cancelled by the user.');
    process.exit(1);
  }
}

export async function resolveConfig(cliArgs: CliArgs): Promise<ResolvedConfig> {
  const { projectName: initialProjectName, flags } = cliArgs;
  const isYes = Boolean(flags.yes);

  p.intro(pc.bgCyan(pc.black(' create-my-stack ')));

  // 1. Project Type
  let projectType: ProjectType;
  if (flags.type) {
    projectType = flags.type;
  } else if (isYes) {
    projectType = 'fe';
  } else {
    const typePrompt = await p.select({
      message: 'Select a project type:',
      options: [
        { label: 'Frontend (Next.js 16 + React 19 + Tailwind v4 + AI Rules)', value: 'fe' },
        { label: 'Backend (NestJS 11 Monorepo + Prisma 7 + PostgreSQL + TimescaleDB)', value: 'be' },
      ],
      initialValue: 'fe',
    });
    handleCancel(typePrompt);
    projectType = typePrompt as ProjectType;
  }

  // 2. Project Name
  let projectName = initialProjectName;
  if (projectName) {
    const validation = validateProjectName(projectName);
    if (!validation.valid) {
      console.warn(pc.yellow(`⚠️  Invalid project name "${projectName}": ${validation.message}`));
      projectName = undefined;
    }
  }

  if (!projectName) {
    if (isYes) {
      projectName = projectType === 'fe' ? 'my-frontend' : 'my-backend';
    } else {
      const defaultName = projectType === 'fe' ? 'my-dashboard' : 'my-backend-api';
      const namePrompt = await p.text({
        message: 'Enter a project name (supports @org/name):',
        placeholder: defaultName,
        defaultValue: defaultName,
        validate(val) {
          const check = validateProjectName(val ?? '');
          if (!check.valid) return check.message;
        },
      });
      handleCancel(namePrompt);
      projectName = String(namePrompt);
    }
  }

  const resolvedProjectName: string = projectName;
  const sanitizedProjectName = getSanitizedProjectName(resolvedProjectName);

  // 3. Target Directory
  let rawTargetDir = flags.dir;
  if (!rawTargetDir) {
    if (isYes) {
      rawTargetDir = `./${sanitizedProjectName}`;
    } else {
      const defaultDir = `./${sanitizedProjectName}`;
      const dirPrompt = await p.text({
        message: 'Enter a destination directory (use "." for the current directory):',
        placeholder: defaultDir,
        defaultValue: defaultDir,
      });
      handleCancel(dirPrompt);
      rawTargetDir = String(dirPrompt);
    }
  }

  const { absolutePath: targetDir, isCurrentDir, displayPath } = resolveTargetDir(
    rawTargetDir,
    resolvedProjectName,
  );

  // Check if directory exists and is not empty
  let existingDirAction: ExistingDirAction = 'cancel';
  const targetExists = await fs.pathExists(targetDir);
  const targetEmpty = targetExists ? await isDirectoryEmpty(targetDir) : true;

  if (!targetEmpty) {
    if (flags.overwrite) {
      existingDirAction = 'overwrite';
    } else if (isYes) {
      p.cancel(`Directory "${targetDir}" is not empty. Use --overwrite to replace its contents in noninteractive mode.`);
      process.exit(1);
    } else {
      const conflictAction = await p.select({
        message: `Directory "${targetDir}" is not empty. How would you like to proceed?`,
        options: [
          { label: 'Cancel (default)', value: 'cancel' },
          { label: 'Overwrite (delete all existing contents)', value: 'overwrite' },
          { label: 'Merge (overwrite matching files)', value: 'merge' },
        ],
        initialValue: 'cancel',
      });
      handleCancel(conflictAction);

      if (conflictAction === 'cancel') {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
      existingDirAction = conflictAction as ExistingDirAction;
    }
  }

  // 4. Package Manager
  const detectedPm = detectPackageManager();
  let packageManager: PackageManager;

  if (flags.pm) {
    packageManager = flags.pm;
  } else if (isYes) {
    packageManager = detectedPm;
  } else {
    const pmPrompt = await p.select({
      message: 'Select a package manager:',
      options: [
        { label: `pnpm ${detectedPm === 'pnpm' ? '(auto-detected)' : ''}`, value: 'pnpm' },
        { label: `npm ${detectedPm === 'npm' ? '(auto-detected)' : ''}`, value: 'npm' },
        { label: `yarn ${detectedPm === 'yarn' ? '(auto-detected)' : ''}`, value: 'yarn' },
        { label: `bun ${detectedPm === 'bun' ? '(auto-detected)' : ''}`, value: 'bun' },
      ],
      initialValue: detectedPm,
    });
    handleCancel(pmPrompt);
    packageManager = pmPrompt as PackageManager;
  }

  // 5. Git Init
  let git: boolean;
  if (typeof flags.git === 'boolean') {
    git = flags.git;
  } else if (isYes) {
    git = true;
  } else {
    const gitPrompt = await p.confirm({
      message: 'Initialize a Git repository (git init)?',
      initialValue: true,
    });
    handleCancel(gitPrompt);
    git = Boolean(gitPrompt);
  }

  // 6. Install Dependencies
  let install: boolean;
  if (typeof flags.install === 'boolean') {
    install = flags.install;
  } else if (isYes) {
    install = true;
  } else {
    const installPrompt = await p.confirm({
      message: `Install dependencies with ${packageManager} now?`,
      initialValue: true,
    });
    handleCancel(installPrompt);
    install = Boolean(installPrompt);
  }

  // 7. Latest Upgrade
  let latest: boolean;
  if (typeof flags.latest === 'boolean') {
    latest = flags.latest;
  } else if (!install) {
    latest = false;
  } else if (isYes) {
    latest = true;
  } else {
    const latestPrompt = await p.confirm({
      message: 'Upgrade dependencies to their latest versions (with fallback on failure)?',
      initialValue: true,
    });
    handleCancel(latestPrompt);
    latest = Boolean(latestPrompt);
  }

  return {
    projectType,
    projectName: resolvedProjectName,
    sanitizedProjectName,
    targetDir,
    displayTargetDir: displayPath,
    packageManager,
    git,
    install,
    latest,
    existingDirAction,
    isCurrentDir,
  };
}
