import fs from 'fs-extra';
import path from 'node:path';

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.webp',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.exe',
  '.dll',
  '.so',
  '.dylib',
]);

export function isBinaryExtension(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

export function isBinaryBuffer(buffer: Buffer): boolean {
  const len = Math.min(buffer.length, 1024);
  for (let i = 0; i < len; i++) {
    if (buffer[i] === 0) {
      return true;
    }
  }
  return false;
}

export function toTitleCase(str: string): string {
  const withoutScope = str.includes('/') ? str.split('/')[1] ?? str : str.replace(/^@/, '');
  return withoutScope
    .split(/[_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function toDbName(str: string): string {
  return str
    .replace(/^@/, '')
    .replace(/[/.-]+/g, '_')
    .toLowerCase();
}

export function buildTemplateVariables(
  projectName: string,
  sanitizedProjectName: string,
): Record<string, string> {
  const title = toTitleCase(projectName);
  const dbName = toDbName(projectName);

  return {
    projectName,
    sanitizedProjectName,
    projectNameTitle: title,
    projectNameDb: dbName,
  };
}

export function replacePlaceholdersInContent(
  content: string,
  vars: Record<string, string>,
  fileName?: string,
): string {
  let result = content;

  const isDockerFile = fileName && (fileName.includes('docker') || fileName.endsWith('.yml') || fileName.endsWith('.yaml'));
  const dockerSafeName = vars.sanitizedProjectName || vars.projectName;

  if (isDockerFile) {
    result = result.replace(/\{\{projectName\}\}/g, dockerSafeName);
  }

  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

export async function processFilePlaceholders(
  filePath: string,
  vars: Record<string, string>,
): Promise<boolean> {
  if (isBinaryExtension(filePath)) {
    return false;
  }

  const buffer = await fs.readFile(filePath);
  if (isBinaryBuffer(buffer)) {
    return false;
  }

  const content = buffer.toString('utf8');
  const fileName = path.basename(filePath);
  const updated = replacePlaceholdersInContent(content, vars, fileName);

  if (updated !== content) {
    await fs.writeFile(filePath, updated, 'utf8');
    return true;
  }

  return false;
}
