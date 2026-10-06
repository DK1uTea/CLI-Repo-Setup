import { cac } from 'cac';
import type { CliArgs, CliFlags, PackageManager, ProjectType } from './types.js';

export function parseCliArgs(argv = process.argv): CliArgs {
  const cli = cac('create-my-stack');

  cli
    .command('[project-name]', 'Project name to create')
    .option('--type <type>', 'Project type (fe: Next.js frontend, be: NestJS backend)')
    .option('--dir <path>', 'Destination directory')
    .option('--pm <package-manager>', 'Package manager (pnpm, npm, yarn, bun)')
    .option('--git', 'Initialize a Git repository')
    .option('--no-git', 'Skip Git initialization')
    .option('--install', 'Install dependencies after scaffolding')
    .option('--no-install', 'Skip dependency installation')
    .option('--latest', 'Upgrade dependencies to their latest versions')
    .option('--no-latest', 'Keep dependency versions from the template')
    .option('--overwrite', 'Overwrite a nonempty destination directory')
    .option('-y, --yes', 'Use defaults without prompts');

  cli.help();
  cli.version('0.1.0');

  const parsed = cli.parse(argv, { run: false });

  if (parsed.options.help || parsed.options.version) {
    process.exit(0);
  }

  const rawProjectName = parsed.args[0] ? String(parsed.args[0]) : undefined;

  let projectType: ProjectType | undefined;
  if (parsed.options.type === 'fe' || parsed.options.type === 'be') {
    projectType = parsed.options.type;
  }

  let packageManager: PackageManager | undefined;
  if (['pnpm', 'npm', 'yarn', 'bun'].includes(parsed.options.pm)) {
    packageManager = parsed.options.pm as PackageManager;
  }

  const flags: CliFlags = {
    type: projectType,
    dir: parsed.options.dir ? String(parsed.options.dir) : undefined,
    pm: packageManager,
    git: parsed.options.git,
    install: parsed.options.install,
    latest: parsed.options.latest,
    overwrite: Boolean(parsed.options.overwrite),
    yes: Boolean(parsed.options.yes),
  };

  return {
    projectName: rawProjectName,
    flags,
  };
}
