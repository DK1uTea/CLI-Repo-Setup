import { extractKeyFromUrl, getFilename } from '@/lib/file-utils'
import type { UploadFile } from '@/shared/components/ui/upload-dropzone'
import type { UploadedEventFile } from '../(hooks)/use-upload-event-files'

export function mapEventImageUrlsToFiles(value: unknown): UploadFile[] {
  if (!Array.isArray(value)) return []

  return value.filter((url): url is string => typeof url === 'string').map((url) => ({
    name: getFilename(url),
    url,
    preview: url,
    key: extractKeyFromUrl(url),
    isUploaded: true,
  }))
}

// Matched by object identity against `pending` (not by filename) — a file
// cropped twice keeps its original filename for both crops, so matching by
// name would resolve both entries to whichever upload result happened to
// come first, silently discarding one crop.
export function mergeUploadedEventImages(
  images: UploadFile[],
  pending: UploadFile[],
  uploaded: UploadedEventFile[],
): UploadFile[] {
  const uploadedByImage = new Map(pending.map((image, i) => [image, uploaded[i]]))

  return images.map((image) => {
    const match = uploadedByImage.get(image)
    if (!match) return image

    return {
      ...image,
      url: match.url,
      key: match.key,
      isUploaded: true,
    }
  })
}

export function getEventImagePayload(images: UploadFile[]): string[] {
  return images
    .map((image) => image.key || image.url)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
}
