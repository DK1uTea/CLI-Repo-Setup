import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  copyTemplateFiles,
  isDirectoryEmpty,
  prepareTargetDirectory,
  scaffoldProject,
} from '../src/scaffold.js';

describe('scaffold helpers and operations', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-scaffold-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('detects empty and non-empty directory correctly', async () => {
    expect(await isDirectoryEmpty(tmpDir)).toBe(true);
    await fs.writeFile(path.join(tmpDir, 'file.txt'), 'content');
    expect(await isDirectoryEmpty(tmpDir)).toBe(false);
  });

  it('prepares target directory with action cancel on non-empty folder', async () => {
    await fs.writeFile(path.join(tmpDir, 'file.txt'), 'content');
    await expect(prepareTargetDirectory(tmpDir, 'cancel')).rejects.toThrow(/not empty/);
  });

  it('prepares target directory with action overwrite by clearing contents', async () => {
    await fs.writeFile(path.join(tmpDir, 'file.txt'), 'content');
    const { createdNew } = await prepareTargetDirectory(tmpDir, 'overwrite');
    expect(createdNew).toBe(false);
    expect(await isDirectoryEmpty(tmpDir)).toBe(true);
  });

  it('copies template and renames _gitignore to .gitignore', async () => {
    const mockSrc = path.join(tmpDir, 'mock-src');
    const mockDest = path.join(tmpDir, 'mock-dest');
    await fs.ensureDir(mockSrc);
    await fs.writeFile(path.join(mockSrc, '_gitignore'), 'node_modules\n');
    await fs.writeFile(path.join(mockSrc, 'index.ts'), 'console.log("hello");');

    await copyTemplateFiles(mockSrc, mockDest);

    expect(await fs.pathExists(path.join(mockDest, '.gitignore'))).toBe(true);
    expect(await fs.pathExists(path.join(mockDest, '_gitignore'))).toBe(false);
    expect(await fs.readFile(path.join(mockDest, '.gitignore'), 'utf8')).toBe('node_modules\n');
  });

  it('scaffolds FE template with placeholders replaced', async () => {
    const target = path.join(tmpDir, 'my-frontend');
    const res = await scaffoldProject({
      projectType: 'fe',
      projectName: '@myorg/dashboard-app',
      sanitizedProjectName: 'dashboard-app',
      targetDir: target,
    });

    expect(res.createdNewDir).toBe(true);
    expect(await fs.pathExists(path.join(target, 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(target, '.gitignore'))).toBe(true);
    expect(await fs.pathExists(path.join(target, 'AGENTS.md'))).toBe(true);
    expect(await fs.pathExists(path.join(target, 'CLAUDE.md'))).toBe(true);

    const pkg = await fs.readJson(path.join(target, 'package.json'));
    expect(pkg.name).toBe('@myorg/dashboard-app');
  });

  it('scaffolds BE template with monorepo app folder renamed', async () => {
    const target = path.join(tmpDir, 'my-backend');
    const res = await scaffoldProject({
      projectType: 'be',
      projectName: '@myorg/core-api',
      sanitizedProjectName: 'core-api',
      targetDir: target,
    });

    expect(res.createdNewDir).toBe(true);
    expect(await fs.pathExists(path.join(target, 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(target, 'apps', 'core-api'))).toBe(true);
    expect(await fs.pathExists(path.join(target, 'apps', '__projectName__'))).toBe(false);

    const pkg = await fs.readJson(path.join(target, 'package.json'));
    expect(pkg.name).toBe('@myorg/core-api');
    expect(pkg.scripts['dev:api']).toBe('nest start core-api --watch');

    const nestCli = await fs.readJson(path.join(target, 'nest-cli.json'));
    expect(nestCli.root).toBe('apps/core-api');
    expect(nestCli.projects['core-api']).toBeDefined();
  });
});
