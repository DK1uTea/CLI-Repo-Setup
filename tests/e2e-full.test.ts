import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { execa } from 'execa';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const CLI_ENTRY = path.resolve(__dirname, '../dist/index.js');
const shouldRunFull = process.env.E2E_FULL === '1';

describe.skipIf(!shouldRunFull)('E2E Full Install & Build Verification', () => {
  let tmpRoot: string;

  beforeAll(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'create-stack-full-'));
  }, 120000);

  afterAll(async () => {
    if (tmpRoot && (await fs.pathExists(tmpRoot))) {
      await fs.remove(tmpRoot).catch(() => {});
    }
  });

  it('scaffolds, installs, and builds Frontend template', async () => {
    const targetDir = path.join(tmpRoot, 'full-test-fe');

    const result = await execa(
      'node',
      [
        CLI_ENTRY,
        'full-test-fe',
        '--type',
        'fe',
        '--dir',
        targetDir,
        '--pm',
        'pnpm',
        '--install',
        '--no-latest',
        '--no-git',
        '--yes',
      ],
      { cwd: tmpRoot, stdio: 'inherit' },
    );

    expect(result.exitCode).toBe(0);

    const buildRes = await execa('pnpm', ['build'], { cwd: targetDir, stdio: 'inherit' });
    expect(buildRes.exitCode).toBe(0);
  }, 300000);

  it('scaffolds, installs, and builds Backend template', async () => {
    const targetDir = path.join(tmpRoot, 'full-test-be');

    const result = await execa(
      'node',
      [
        CLI_ENTRY,
        'full-test-be',
        '--type',
        'be',
        '--dir',
        targetDir,
        '--pm',
        'pnpm',
        '--install',
        '--no-latest',
        '--no-git',
        '--yes',
      ],
      { cwd: tmpRoot, stdio: 'inherit' },
    );

    expect(result.exitCode).toBe(0);

    await execa('pnpm', ['prisma:generate'], { cwd: targetDir, stdio: 'inherit' });
    const buildRes = await execa('pnpm', ['build'], { cwd: targetDir, stdio: 'inherit' });
    expect(buildRes.exitCode).toBe(0);
  }, 300000);
});
