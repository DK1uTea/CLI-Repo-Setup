import { describe, expect, it } from 'vitest';

import {
  CHAT_ATTACHMENT_MAX_FILES,
  CHAT_ATTACHMENT_MAX_SIZE,
  classifyChatAttachment,
  hasChatContent,
  parseChatContent,
  serializeChatContent,
  validateChatAttachmentSelection,
  type ChatAttachment,
} from '@/features/cam/activation-detail/(helpers)/chat-attachment-utils';

function file(name: string, type: string, size = 1): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe('chat attachment validation', () => {
  it.each([
    ['photo.jpg', 'image/jpeg', 'image'],
    ['photo.png', 'image/png', 'image'],
    ['animation.gif', 'image/gif', 'image'],
    ['photo.webp', 'image/webp', 'image'],
    ['document.pdf', 'application/pdf', 'document'],
    ['document.doc', 'application/msword', 'document'],
    ['document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'document'],
    ['sheet.xls', 'application/vnd.ms-excel', 'document'],
    ['sheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'document'],
  ])('accepts %s', (name, type, expectedKind) => {
    expect(classifyChatAttachment(file(name, type))).toBe(expectedKind);
  });

  it.each([
    ['vector.svg', 'image/svg+xml'],
    ['program.exe', 'application/x-msdownload'],
    ['video.mp4', 'video/mp4'],
  ])('rejects unsupported file %s', (name, type) => {
    expect(classifyChatAttachment(file(name, type))).toBeNull();
  });

  it('keeps valid files while reporting unsupported and oversized files', () => {
    const valid = file('photo.webp', 'image/webp');
    const unsupported = file('vector.svg', 'image/svg+xml');
    const oversized = file('large.pdf', 'application/pdf', CHAT_ATTACHMENT_MAX_SIZE + 1);

    const result = validateChatAttachmentSelection([valid, unsupported, oversized], 0);

    expect(result.accepted).toEqual([valid]);
    expect(result.rejected).toEqual([
      { file: unsupported, reason: 'unsupported' },
      { file: oversized, reason: 'too-large' },
    ]);
  });

  it('keeps only the remaining slots when a selection exceeds five attachments', () => {
    const selected = Array.from({ length: CHAT_ATTACHMENT_MAX_FILES }, (_, index) =>
      file(`photo-${index}.png`, 'image/png'),
    );

    const result = validateChatAttachmentSelection(selected, 3);

    expect(result.accepted).toEqual(selected.slice(0, 2));
    expect(result.rejected).toEqual(
      selected.slice(2).map((selectedFile) => ({ file: selectedFile, reason: 'too-many' })),
    );
  });
});

describe('chat attachment HTML', () => {
  const attachments: ChatAttachment[] = [
    {
      id: 'image-1',
      kind: 'image',
      fileName: 'photo & one.webp',
      mimeType: 'image/webp',
      src: 'https://cdn.test/photo.webp?one=1&two=2',
    },
    {
      id: 'document-1',
      kind: 'document',
      fileName: 'report "final".pdf',
      mimeType: 'application/pdf',
      src: 'https://cdn.test/report.pdf',
    },
  ];

  it('round-trips image and document metadata without losing rich text', () => {
    const html = serializeChatContent('<p>Hello <strong>world</strong></p>', attachments);
    const parsed = parseChatContent(html);

    expect(parsed.content).toBe('<p>Hello <strong>world</strong></p>');
    expect(parsed.attachments).toEqual(attachments);
    expect(html).not.toContain('photo & one.webp');
    expect(html).not.toContain('report "final".pdf');
  });

  it('parses legacy plain image tags as image attachments', () => {
    const parsed = parseChatContent('<div><img src="https://cdn.test/legacy.png" /></div><p>Text</p>');

    expect(parsed.content).toBe('<p>Text</p>');
    expect(parsed.attachments).toEqual([
      {
        id: 'attachment-0',
        kind: 'image',
        fileName: 'legacy.png',
        mimeType: 'image/png',
        src: 'https://cdn.test/legacy.png',
      },
    ]);
  });

  it('treats an attachment-only message as non-empty', () => {
    expect(hasChatContent(serializeChatContent('', attachments))).toBe(true);
    expect(hasChatContent('<p><br></p>')).toBe(false);
  });

  it('does not parse unsafe attachment URLs as interactive attachments', () => {
    const html = '<a data-chat-attachment="document" data-file-name="bad.pdf" data-mime-type="application%2Fpdf" href="javascript:alert(1)">bad.pdf</a>';

    expect(parseChatContent(html).attachments).toEqual([]);
  });
});
