import { describe, expect, it } from 'vitest';
import { parseCliArgs } from '../../src/cli.js';

describe('parseCliArgs', () => {
  it('parses a complete noninteractive frontend request', () => {
    const parsed = parseCliArgs([
      'node',
      'create-my-stack',
      '@team/dashboard',
      '--type', 'fe',
      '--dir', './dashboard',
      '--pm', 'pnpm',
      '--no-git',
      '--no-install',
      '--no-latest',
      '--yes',
    ]);

    expect(parsed.projectName).toBe('@team/dashboard');
    expect(parsed.flags).toMatchObject({
      type: 'fe',
      dir: './dashboard',
      pm: 'pnpm',
      git: false,
      install: false,
      latest: false,
      yes: true,
    });
  });

  it('leaves invalid type and package manager unset for config resolution', () => {
    const parsed = parseCliArgs(['node', 'create-my-stack', 'app', '--type', 'mobile', '--pm', 'other']);

    expect(parsed.projectName).toBe('app');
    expect(parsed.flags.type).toBeUndefined();
    expect(parsed.flags.pm).toBeUndefined();
  });

  it('passes overwrite intent through to directory conflict handling', () => {
    const parsed = parseCliArgs(['node', 'create-my-stack', 'app', '--overwrite', '--yes']);

    expect(parsed.flags.overwrite).toBe(true);
    expect(parsed.flags.yes).toBe(true);
  });
});
