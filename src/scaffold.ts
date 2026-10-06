import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTemplateVariables, processFilePlaceholders } from './placeholders.js';
import type { ExistingDirAction, ProjectType } from './types.js';

export function getTemplateRoot(): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));

  const distParent = path.resolve(currentDir, '..', 'templates');
  if (fs.existsSync(distParent)) {
    return distParent;
  }

  const srcParent = path.resolve(currentDir, '..', 'templates');
  if (fs.existsSync(srcParent)) {
    return srcParent;
  }

  return path.resolve(process.cwd(), 'templates');
}

export function getTemplateDir(projectType: ProjectType): string {
  const root = getTemplateRoot();
  const templateDir = path.join(root, projectType);
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }
  return templateDir;
}

export async function isDirectoryEmpty(dir: string): Promise<boolean> {
  if (!fs.existsSync(dir)) return true;
  const files = await fs.readdir(dir);
  return files.length === 0;
}

export async function prepareTargetDirectory(
  targetDir: string,
  action: ExistingDirAction = 'cancel',
): Promise<{ createdNew: boolean }> {
  const exists = await fs.pathExists(targetDir);

  if (!exists) {
    await fs.ensureDir(targetDir);
    return { createdNew: true };
  }

  const empty = await isDirectoryEmpty(targetDir);
  if (empty) {
    return { createdNew: false };
  }

  if (action === 'cancel') {
    throw new Error(`Target directory "${targetDir}" is not empty. Operation cancelled.`);
  }

  if (action === 'overwrite') {
    await fs.emptyDir(targetDir);
  }

  return { createdNew: false };
}

export async function copyTemplateFiles(srcDir: string, destDir: string): Promise<void> {
  await fs.copy(srcDir, destDir, {
    overwrite: true,
    filter: (src) => {
      const base = path.basename(src);
      if (
        base === 'node_modules' ||
        base === '.git' ||
        base === '.next' ||
        base === 'dist' ||
        base === 'template-shims.d.ts'
      ) {
        return false;
      }
      return true;
    },
  });

  const gitignore = path.join(destDir, '_gitignore');
  if (await fs.pathExists(gitignore)) {
    await fs.move(gitignore, path.join(destDir, '.gitignore'), { overwrite: true });
  }

  const npmrc = path.join(destDir, '_npmrc');
  if (await fs.pathExists(npmrc)) {
    await fs.move(npmrc, path.join(destDir, '.npmrc'), { overwrite: true });
  }

  // Templates are inspected without their own dependencies in this repository.
  // Restore full type checking in every generated project.
  const tsconfigPath = path.join(destDir, 'tsconfig.json');
  if (await fs.pathExists(tsconfigPath)) {
    const tsconfig = await fs.readJson(tsconfigPath);
    delete tsconfig.compilerOptions.noCheck;
    if (path.basename(srcDir) === 'be') {
      tsconfig.compilerOptions.types = ['multer'];
    }
    await fs.writeJson(tsconfigPath, tsconfig, { spaces: 2 });
  }
}

export async function replaceAllPlaceholders(
  rootDir: string,
  vars: Record<string, string>,
): Promise<number> {
  let count = 0;

  async function walk(currentPath: string) {
    const stat = await fs.lstat(currentPath);

    if (stat.isDirectory()) {
      const base = path.basename(currentPath);
      if (base === 'node_modules' || base === '.git') return;

      const entries = await fs.readdir(currentPath);
      for (const entry of entries) {
        await walk(path.join(currentPath, entry));
      }
    } else if (stat.isFile()) {
      const modified = await processFilePlaceholders(currentPath, vars);
      if (modified) count++;
    }
  }

  await walk(rootDir);
  return count;
}

export async function handleBackendMonorepoAppDir(
  targetDir: string,
  sanitizedProjectName: string,
): Promise<void> {
  const oldAppDir = path.join(targetDir, 'apps', '__projectName__');
  const newAppDir = path.join(targetDir, 'apps', sanitizedProjectName);

  if (await fs.pathExists(oldAppDir)) {
    if (oldAppDir !== newAppDir) {
      await fs.move(oldAppDir, newAppDir, { overwrite: true });
    }
  }
}

export async function scaffoldProject(options: {
  projectType: ProjectType;
  projectName: string;
  sanitizedProjectName: string;
  targetDir: string;
  existingDirAction?: ExistingDirAction;
}): Promise<{ createdNewDir: boolean }> {
  const { projectType, projectName, sanitizedProjectName, targetDir, existingDirAction = 'cancel' } = options;

  const { createdNew } = await prepareTargetDirectory(targetDir, existingDirAction);

  try {
    const templateDir = getTemplateDir(projectType);
    await copyTemplateFiles(templateDir, targetDir);

    if (projectType === 'be') {
      await handleBackendMonorepoAppDir(targetDir, sanitizedProjectName);
    }

    const vars = buildTemplateVariables(projectName, sanitizedProjectName);
    await replaceAllPlaceholders(targetDir, vars);

    return { createdNewDir: createdNew };
  } catch (error) {
    if (createdNew && (await fs.pathExists(targetDir))) {
      await fs.remove(targetDir).catch(() => {});
    }
    throw error;
  }
}
