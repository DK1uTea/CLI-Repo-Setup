import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getSanitizedProjectName,
  resolveTargetDir,
  validateProjectName,
} from '../../src/validate.js';

describe('validateProjectName', () => {
  it('explains validation errors in English', () => {
    expect(validateProjectName('').message).toBe('Project name cannot be empty.');
    expect(validateProjectName('MyApp').message).toBe('Project name must be lowercase.');
  });

  it('accepts standard valid project names', () => {
    expect(validateProjectName('my-app').valid).toBe(true);
    expect(validateProjectName('my-fe-project').valid).toBe(true);
    expect(validateProjectName('project123').valid).toBe(true);
  });

  it('accepts scoped package names', () => {
    expect(validateProjectName('@org/my-app').valid).toBe(true);
    expect(validateProjectName('@my-team/dashboard').valid).toBe(true);
  });

  it('rejects empty or whitespace names', () => {
    expect(validateProjectName('').valid).toBe(false);
    expect(validateProjectName('   ').valid).toBe(false);
    expect(validateProjectName(' my-app').valid).toBe(false);
    expect(validateProjectName('my-app ').valid).toBe(false);
  });

  it('rejects uppercase characters', () => {
    expect(validateProjectName('MyApp').valid).toBe(false);
    expect(validateProjectName('MY-APP').valid).toBe(false);
  });

  it('rejects names starting with dot or underscore', () => {
    expect(validateProjectName('.my-app').valid).toBe(false);
    expect(validateProjectName('_my-app').valid).toBe(false);
  });

  it('rejects node reserved names and keywords', () => {
    expect(validateProjectName('node_modules').valid).toBe(false);
    expect(validateProjectName('favicon.ico').valid).toBe(false);
    expect(validateProjectName('http').valid).toBe(false);
    expect(validateProjectName('fs').valid).toBe(false);
  });

  it('rejects invalid characters', () => {
    expect(validateProjectName('my app').valid).toBe(false);
    expect(validateProjectName('my$app').valid).toBe(false);
    expect(validateProjectName('my#app').valid).toBe(false);
  });
});

describe('getSanitizedProjectName', () => {
  it('strips scope from scoped package names', () => {
    expect(getSanitizedProjectName('@org/my-app')).toBe('my-app');
    expect(getSanitizedProjectName('@company/billing-service')).toBe('billing-service');
  });

  it('keeps normal names unchanged', () => {
    expect(getSanitizedProjectName('my-app')).toBe('my-app');
  });
});

describe('resolveTargetDir', () => {
  const cwd = 'D:\\projects';

  it('resolves "." to current directory', () => {
    const res = resolveTargetDir('.', 'my-app', cwd);
    expect(res.isCurrentDir).toBe(true);
    expect(res.absolutePath).toBe(path.resolve(cwd));
  });

  it('resolves relative directory based on project name by default', () => {
    const res = resolveTargetDir(undefined, 'my-app', cwd);
    expect(res.isCurrentDir).toBe(false);
    expect(res.absolutePath).toBe(path.resolve(cwd, 'my-app'));
  });

  it('resolves custom relative path', () => {
    const res = resolveTargetDir('./sub/folder', 'my-app', cwd);
    expect(res.isCurrentDir).toBe(false);
    expect(res.absolutePath).toBe(path.resolve(cwd, './sub/folder'));
  });

  it('resolves absolute path directly', () => {
    const abs = path.resolve('C:\\target\\path');
    const res = resolveTargetDir(abs, 'my-app', cwd);
    expect(res.isCurrentDir).toBe(false);
    expect(res.absolutePath).toBe(abs);
  });
});
