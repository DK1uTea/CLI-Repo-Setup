import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  buildTemplateVariables,
  isBinaryBuffer,
  isBinaryExtension,
  processFilePlaceholders,
  replacePlaceholdersInContent,
  toDbName,
  toTitleCase,
} from '../src/placeholders.js';

describe('placeholders helper functions', () => {
  it('converts to title case correctly', () => {
    expect(toTitleCase('my-project')).toBe('My Project');
    expect(toTitleCase('@org/awesome-fe')).toBe('Awesome Fe');
    expect(toTitleCase('crm_backend')).toBe('Crm Backend');
  });

  it('converts to db name correctly', () => {
    expect(toDbName('my-project')).toBe('my_project');
    expect(toDbName('@org/awesome-fe')).toBe('org_awesome_fe');
  });

  it('detects binary extensions', () => {
    expect(isBinaryExtension('image.png')).toBe(true);
    expect(isBinaryExtension('font.woff2')).toBe(true);
    expect(isBinaryExtension('app.ico')).toBe(true);
    expect(isBinaryExtension('code.ts')).toBe(false);
    expect(isBinaryExtension('README.md')).toBe(false);
  });

  it('detects binary buffers', () => {
    const textBuffer = Buffer.from('Hello world! TypeScript is great.');
    expect(isBinaryBuffer(textBuffer)).toBe(false);

    const binaryBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x0a]);
    expect(isBinaryBuffer(binaryBuffer)).toBe(true);
  });
});

describe('replacePlaceholdersInContent', () => {
  const vars = buildTemplateVariables('my-awesome-app', 'my-awesome-app');

  it('replaces projectName and related variables in text', () => {
    const template = 'name: "{{projectName}}", title: "{{projectNameTitle}}", db: "{{projectNameDb}}"';
    const replaced = replacePlaceholdersInContent(template, vars);
    expect(replaced).toBe('name: "my-awesome-app", title: "My Awesome App", db: "my_awesome_app"');
  });

  it('handles scoped names in docker files with sanitized name', () => {
    const scopedVars = buildTemplateVariables('@myorg/my-service', 'my-service');
    const dockerContent = 'image: {{projectName}}:latest\ncontainer_name: {{projectName}}-api';
    const replaced = replacePlaceholdersInContent(dockerContent, scopedVars, 'docker-compose.yml');
    expect(replaced).toBe('image: my-service:latest\ncontainer_name: my-service-api');
  });

  it('leaves content unchanged if no placeholders exist', () => {
    const plain = 'const a = 123; export default a;';
    expect(replacePlaceholdersInContent(plain, vars)).toBe(plain);
  });
});

describe('processFilePlaceholders', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-placeholders-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('updates text files containing placeholders', async () => {
    const filePath = path.join(tmpDir, 'package.json');
    await fs.writeFile(filePath, '{"name": "{{projectName}}"}', 'utf8');

    const vars = buildTemplateVariables('cool-app', 'cool-app');
    const changed = await processFilePlaceholders(filePath, vars);

    expect(changed).toBe(true);
    const content = await fs.readFile(filePath, 'utf8');
    expect(content).toBe('{"name": "cool-app"}');
  });

  it('skips binary files completely', async () => {
    const pngPath = path.join(tmpDir, 'test.png');
    const binaryData = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    await fs.writeFile(pngPath, binaryData);

    const vars = buildTemplateVariables('cool-app', 'cool-app');
    const changed = await processFilePlaceholders(pngPath, vars);

    expect(changed).toBe(false);
    const finalBuffer = await fs.readFile(pngPath);
    expect(finalBuffer.equals(binaryData)).toBe(true);
  });
});
