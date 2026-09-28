import { getFilename } from '@/lib/file-utils';

export const CHAT_ATTACHMENT_MAX_FILES = 5;
export const CHAT_ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024;

const MIME_KIND = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
} as const;

const EXTENSION_MIME: Record<string, keyof typeof MIME_KIND> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const CHAT_ATTACHMENT_ACCEPT = Object.keys(MIME_KIND).join(',');

export type ChatAttachmentKind = 'image' | 'document';

export type ChatAttachment = {
  id: string;
  kind: ChatAttachmentKind;
  fileName: string;
  mimeType: string;
  src: string;
  file?: File;
};

export type ChatAttachmentRejectionReason = 'unsupported' | 'too-large' | 'too-many';

function extension(value: string): string {
  return value.split('?')[0]?.split('.').pop()?.toLowerCase() ?? '';
}

export function classifyChatAttachment(file: Pick<File, 'name' | 'type'>): ChatAttachmentKind | null {
  const expectedMime = EXTENSION_MIME[extension(file.name)];
  if (!expectedMime || (file.type && file.type !== expectedMime)) return null;
  return MIME_KIND[expectedMime];
}

export function validateChatAttachmentSelection(files: File[], existingCount: number) {
  let remainingSlots = Math.max(0, CHAT_ATTACHMENT_MAX_FILES - existingCount);
  const accepted: File[] = [];
  const rejected: Array<{ file: File; reason: ChatAttachmentRejectionReason }> = [];

  files.forEach((file) => {
    if (!classifyChatAttachment(file)) {
      rejected.push({ file, reason: 'unsupported' });
    } else if (file.size > CHAT_ATTACHMENT_MAX_SIZE) {
      rejected.push({ file, reason: 'too-large' });
    } else if (remainingSlots === 0) {
      rejected.push({ file, reason: 'too-many' });
    } else {
      accepted.push(file);
      remainingSlots -= 1;
    }
  });

  return { accepted, rejected };
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeText(value: string): string {
  return escapeAttribute(value).replace(/'/g, '&#39;');
}

function encodedAttribute(name: string, value: string): string {
  return `data-${name}="${encodeURIComponent(value)}"`;
}

export function serializeChatContent(content: string, attachments: ChatAttachment[]): string {
  if (!attachments.length) return content;
  const items = attachments.map((attachment) => {
    const metadata = `${encodedAttribute('attachment-id', attachment.id)} ${encodedAttribute('file-name', attachment.fileName)} ${encodedAttribute('mime-type', attachment.mimeType)}`;
    const src = escapeAttribute(attachment.src);
    if (attachment.kind === 'image') {
      return `<img data-chat-attachment="image" ${metadata} src="${src}" alt="${escapeAttribute(attachment.fileName)}" />`;
    }
    return `<a data-chat-attachment="document" ${metadata} href="${src}">${escapeText(attachment.fileName)}</a>`;
  }).join('');
  return `<div data-chat-attachments="true">${items}</div>${content}`;
}

function attribute(source: string, name: string): string {
  const match = source.match(new RegExp(`(?:^|\\s)${name}=["']([^"']*)["']`, 'i'));
  return match?.[1]?.replace(/&amp;/gi, '&').replace(/&quot;/gi, '"') ?? '';
}

function decodedDataAttribute(source: string, name: string): string {
  const value = attribute(source, `data-${name}`);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function mimeFromUrl(src: string): string {
  return EXTENSION_MIME[extension(src)] ?? 'image/jpeg';
}

function isSafeAttachmentUrl(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function parseChatContent(html: string): { content: string; attachments: ChatAttachment[] } {
  if (!html) return { content: '', attachments: [] };
  const attachments: ChatAttachment[] = [];
  let index = 0;
  const content = html.replace(/<img\b([^>]*)\/?\s*>|<a\b([^>]*)>[\s\S]*?<\/a>/gi, (tag, imageAttrs: string | undefined, anchorAttrs: string | undefined) => {
    const element = imageAttrs !== undefined ? 'img' : 'a';
    const attrs = imageAttrs ?? anchorAttrs ?? '';
    const declaredKind = attribute(attrs, 'data-chat-attachment');
    if (element.toLowerCase() === 'a' && declaredKind !== 'document') return tag;
    const src = attribute(attrs, element.toLowerCase() === 'img' ? 'src' : 'href');
    if (!src) return tag;
    if (!isSafeAttachmentUrl(src)) return '';
    const kind: ChatAttachmentKind = declaredKind === 'document' ? 'document' : 'image';
    const fileName = decodedDataAttribute(attrs, 'file-name') || getFilename(src) || `attachment-${index + 1}`;
    attachments.push({
      id: decodedDataAttribute(attrs, 'attachment-id') || `attachment-${index}`,
      kind,
      fileName,
      mimeType: decodedDataAttribute(attrs, 'mime-type') || mimeFromUrl(src),
      src,
    });
    index += 1;
    return '';
  })
    .replace(/<div\b[^>]*data-chat-(?:attachments|images)[^>]*>\s*<\/div>/gi, '')
    .replace(/<div>\s*<\/div>/gi, '')
    .trim();
  return { content, attachments };
}

export function hasChatContent(html: string): boolean {
  if (!html) return false;
  if (/<(?:img|a)\b[^>]*data-chat-attachment/i.test(html) || /<img\b[^>]*\bsrc=/i.test(html)) return true;
  return html.replace(/<br\s*\/?\s*>/gi, '').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim().length > 0;
}
