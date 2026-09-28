import { cac } from 'cac';
import type { CliArgs, CliFlags, PackageManager, ProjectType } from './types.js';

export function parseCliArgs(argv = process.argv): CliArgs {
  const cli = cac('create-my-stack');

  cli
    .command('[project-name]', 'Tên project cần khởi tạo')
    .option('--type <type>', 'Loại project (fe: Frontend Next.js, be: Backend NestJS)')
    .option('--dir <path>', 'Thư mục đích')
    .option('--pm <package-manager>', 'Package manager (pnpm, npm, yarn, bun)')
    .option('--git', 'Khởi tạo Git repository')
    .option('--no-git', 'Không khởi tạo Git')
    .option('--install', 'Cài đặt dependencies sau khi tạo')
    .option('--no-install', 'Không cài đặt dependencies')
    .option('--latest', 'Nâng cấp dependencies lên bản mới nhất')
    .option('--no-latest', 'Giữ nguyên phiên bản trong template')
    .option('--overwrite', 'Tự động ghi đè nếu thư mục đích không rỗng')
    .option('-y, --yes', 'Dùng toàn bộ giá trị mặc định, không hiện prompt');

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
