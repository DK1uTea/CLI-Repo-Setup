import * as prompts from '@clack/prompts';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveConfig } from '../../src/prompts.js';

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  select: vi.fn(),
  text: vi.fn(),
  confirm: vi.fn(),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
}));

describe('resolveConfig in interactive mode', () => {
  let tmpDir: string;
  const select = vi.mocked(prompts.select);
  const text = vi.mocked(prompts.text);
  const confirm = vi.mocked(prompts.confirm);

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-prompts-interactive-'));
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('keeps unrelated files when the user selects merge', async () => {
    const targetDir = path.join(tmpDir, 'existing');
    await fs.ensureDir(targetDir);
    await fs.writeFile(path.join(targetDir, 'custom.txt'), 'keep me');
    select
      .mockResolvedValueOnce('fe')
      .mockResolvedValueOnce('merge')
      .mockResolvedValueOnce('pnpm');
    confirm
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    const config = await resolveConfig({ projectName: 'app', flags: { dir: targetDir } });

    expect(config).toMatchObject({
      projectType: 'fe',
      projectName: 'app',
      targetDir,
      existingDirAction: 'merge',
      packageManager: 'pnpm',
      git: false,
      install: false,
      latest: false,
    });
    expect(await fs.readFile(path.join(targetDir, 'custom.txt'), 'utf8')).toBe('keep me');
    expect(select).toHaveBeenCalledWith(expect.objectContaining({
      message: `Directory "${targetDir}" is not empty. How would you like to proceed?`,
    }));
  });

  it('uses the entered name and directory when they are omitted from arguments', async () => {
    const targetDir = path.join(tmpDir, 'chosen');
    select.mockResolvedValueOnce('be').mockResolvedValueOnce('pnpm');
    text.mockResolvedValueOnce('chosen-api').mockResolvedValueOnce(targetDir);
    confirm
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    const config = await resolveConfig({ flags: {} });

    expect(config).toMatchObject({
      projectType: 'be',
      projectName: 'chosen-api',
      sanitizedProjectName: 'chosen-api',
      targetDir,
      existingDirAction: 'cancel',
    });
  });
});
