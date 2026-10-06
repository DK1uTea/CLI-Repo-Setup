import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { execa } from 'execa';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initGit, printNextSteps, runInstall, runUpgradeLatest } from '../../src/post.js';
import type { ResolvedConfig } from '../../src/types.js';

vi.mock('execa', () => ({ execa: vi.fn() }));

describe('post-scaffold commands', () => {
  let tmpDir: string;
  const mockedExeca = vi.mocked(execa);

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-post-'));
    mockedExeca.mockReset();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.remove(tmpDir);
  });

  it('reports an initialized repository when the initial commit fails', async () => {
    mockedExeca
      .mockResolvedValueOnce({} as never)
      .mockResolvedValueOnce({} as never)
      .mockRejectedValueOnce(new Error('Git identity missing'));

    await expect(initGit(tmpDir)).resolves.toEqual({ success: true, committed: false });
    expect(mockedExeca.mock.calls.map(([command, args]) => [command, args])).toEqual([
      ['git', ['init']],
      ['git', ['add', '-A']],
      ['git', ['commit', '-m', 'chore: initial scaffold from create-my-stack']],
    ]);
  });

  it('reports failure when git init cannot run', async () => {
    mockedExeca.mockRejectedValueOnce(new Error('git unavailable'));

    await expect(initGit(tmpDir)).resolves.toEqual({ success: false, committed: false });
    expect(mockedExeca).toHaveBeenCalledTimes(1);
  });

  it('installs dependencies in the generated directory with Husky disabled', async () => {
    mockedExeca.mockResolvedValueOnce({} as never);

    await runInstall(tmpDir, 'pnpm');

    expect(mockedExeca).toHaveBeenCalledWith('pnpm', ['install'], {
      cwd: tmpDir,
      stdio: 'inherit',
      env: expect.objectContaining({ HUSKY: '0' }),
    });
  });

  it('restores package.json and retries installation after an upgrade failure', async () => {
    const packagePath = path.join(tmpDir, 'package.json');
    const original = '{"name":"sample","dependencies":{"lib":"^1.0.0"}}\n';
    await fs.writeFile(packagePath, original);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockedExeca
      .mockImplementationOnce(async () => {
        await fs.writeFile(packagePath, '{"name":"sample","dependencies":{"lib":"^2.0.0"}}\n');
        throw new Error('incompatible dependency');
      })
      .mockResolvedValueOnce({} as never);

    const result = await runUpgradeLatest(tmpDir, 'pnpm');

    expect(result).toEqual({ success: false, fallbackOccurred: true });
    expect(await fs.readFile(packagePath, 'utf8')).toBe(original);
    expect(mockedExeca.mock.calls.map(([command, args]) => [command, args])).toEqual([
      ['pnpm', ['up', '--latest']],
      ['pnpm', ['install']],
    ]);
  });

  it('reports a successful upgrade without reinstalling dependencies', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'sample' });
    mockedExeca.mockResolvedValueOnce({} as never);

    await expect(runUpgradeLatest(tmpDir, 'bun')).resolves.toEqual({
      success: true,
      fallbackOccurred: false,
    });
    expect(mockedExeca.mock.calls.map(([command, args]) => [command, args])).toEqual([
      ['bun', ['update']],
    ]);
  });

  it('prints frontend setup commands for the selected package manager', () => {
    const config: ResolvedConfig = {
      projectType: 'fe',
      projectName: 'app',
      sanitizedProjectName: 'app',
      targetDir: tmpDir,
      displayTargetDir: './app',
      packageManager: 'npm',
      git: false,
      install: false,
      latest: false,
      existingDirAction: 'cancel',
      isCurrentDir: false,
    };
    const output = vi.spyOn(console, 'log').mockImplementation(() => {});

    printNextSteps(config);

    const printed = output.mock.calls.map(([message]) => String(message)).join('\n');
    expect(printed).toContain('cd ./app');
    expect(printed).toContain('npm install');
    expect(printed).toContain('npm run dev');
    expect(printed).toContain('npm run test:e2e');
    expect(printed).toContain('Next steps:');
    expect(printed).toContain('Start the Next.js development server');
  });
});
