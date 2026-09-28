import { getFilename } from '@/lib/file-utils';

export type ProofFile = {
  url: string;
  name: string;
};

const IMAGE_EXTENSIONS = new Set(['jpeg', 'jpg', 'png', 'webp', 'heif', 'heic', 'gif']);

export function isProofImageFile(value: string): boolean {
  const extension = value.split('?')[0]?.split('.').pop()?.toLowerCase();
  return !!extension && IMAGE_EXTENSIONS.has(extension);
}

export function toProofFiles(files: unknown): ProofFile[] {
  if (!Array.isArray(files)) return [];

  return files.flatMap((item) => {
    if (typeof item === 'string' && item.trim()) {
      return [{ url: item, name: getFilename(item) }];
    }

    if (!item || typeof item !== 'object') return [];

    const record = item as {
      url?: unknown;
      fileUrl?: unknown;
      fileName?: unknown;
      name?: unknown;
    };
    const url = [record.url, record.fileUrl].find(
      (value): value is string => typeof value === 'string' && value.trim() !== '',
    );
    if (!url) return [];

    const name =
      (typeof record.fileName === 'string' && record.fileName)
      || (typeof record.name === 'string' && record.name)
      || getFilename(url);

    return [{ url, name }];
  });
}
