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
    spinner.start(`Đang thiết lập dự án ${pc.cyan(config.projectName)} (${config.projectType.toUpperCase()})...`);

    await scaffoldProject({
      projectType: config.projectType,
      projectName: config.projectName,
      sanitizedProjectName: config.sanitizedProjectName,
      targetDir: config.targetDir,
      existingDirAction: config.existingDirAction,
    });

    spinner.stop(pc.green(`✔ Đã tạo template thành công tại `) + pc.cyan(config.targetDir));

    // Git Init
    if (config.git) {
      spinner.start('Đang khởi tạo Git repository...');
      const gitRes = await initGit(config.targetDir);
      if (gitRes.success) {
        spinner.stop(pc.green('✔ Đã khởi tạo Git repository và tạo initial commit'));
      } else {
        spinner.stop(pc.yellow('⚠️  Không thể khởi tạo Git repository (vui lòng chạy "git init" thủ công)'));
      }
    }

    // Install Dependencies
    if (config.install) {
      console.log(pc.cyan(`\n📦 Đang cài đặt dependencies bằng ${config.packageManager}...`));
      await runInstall(config.targetDir, config.packageManager);
      console.log(pc.green(`✔ Đã cài đặt dependencies thành công!\n`));

      // Latest Upgrade
      if (config.latest) {
        console.log(pc.cyan(`🚀 Đang nâng cấp dependencies lên bản mới nhất...`));
        const upgradeRes = await runUpgradeLatest(config.targetDir, config.packageManager);
        if (upgradeRes.success) {
          console.log(pc.green(`✔ Nâng cấp dependencies lên latest thành công!\n`));
        }
      }
    }

    printNextSteps(config);
    p.outro(pc.green('Khởi tạo dự án hoàn tất!'));
  } catch (error) {
    spinner.stop(pc.red('✖ Thao tác thất bại'));
    console.error(pc.red('\nĐã xảy ra lỗi trong quá trình khởi tạo:'));
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
