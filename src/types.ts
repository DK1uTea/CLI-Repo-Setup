export type ProjectType = 'fe' | 'be';

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

export type ExistingDirAction = 'cancel' | 'overwrite' | 'merge';

export interface CliFlags {
  type?: 'fe' | 'be';
  dir?: string;
  pm?: PackageManager;
  git?: boolean;
  install?: boolean;
  latest?: boolean;
  overwrite?: boolean;
  yes?: boolean;
  help?: boolean;
  version?: boolean;
}

export interface CliArgs {
  projectName?: string;
  flags: CliFlags;
}

export interface ResolvedConfig {
  projectType: ProjectType;
  projectName: string;
  sanitizedProjectName: string;
  targetDir: string;
  displayTargetDir: string;
  packageManager: PackageManager;
  git: boolean;
  install: boolean;
  latest: boolean;
  existingDirAction: ExistingDirAction;
  isCurrentDir: boolean;
}
