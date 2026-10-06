import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveConfig } from '../../src/prompts.js';

describe('resolveConfig in noninteractive mode', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-prompts-'));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.remove(tmpDir);
  });

  it('uses frontend defaults when --yes is set without a project name', async () => {
    const targetDir = path.join(tmpDir, 'frontend');

    const config = await resolveConfig({
      flags: { yes: true, dir: targetDir, pm: 'pnpm' },
    });

    expect(config).toMatchObject({
      projectType: 'fe',
      projectName: 'my-frontend',
      sanitizedProjectName: 'my-frontend',
      targetDir,
      packageManager: 'pnpm',
      git: true,
      install: true,
      latest: true,
      existingDirAction: 'cancel',
    });
  });

  it('disables upgrades when installation is disabled', async () => {
    const config = await resolveConfig({
      projectName: '@team/service',
      flags: {
        yes: true,
        type: 'be',
        dir: path.join(tmpDir, 'backend'),
        pm: 'pnpm',
        git: false,
        install: false,
      },
    });

    expect(config).toMatchObject({
      projectType: 'be',
      projectName: '@team/service',
      sanitizedProjectName: 'service',
      git: false,
      install: false,
      latest: false,
    });
  });

  it('accepts an explicit overwrite for a nonempty destination', async () => {
    const targetDir = path.join(tmpDir, 'existing');
    await fs.ensureDir(targetDir);
    await fs.writeFile(path.join(targetDir, 'keep-for-now.txt'), 'existing data');

    const config = await resolveConfig({
      projectName: 'app',
      flags: { yes: true, dir: targetDir, pm: 'pnpm', overwrite: true, install: false },
    });

    expect(config.existingDirAction).toBe('overwrite');
    expect(await fs.readFile(path.join(targetDir, 'keep-for-now.txt'), 'utf8')).toBe('existing data');
  });
});
