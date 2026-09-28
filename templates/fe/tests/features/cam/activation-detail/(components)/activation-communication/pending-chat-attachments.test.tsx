import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import { PendingChatAttachments } from '@/features/cam/activation-detail/(components)/activation-communication/pending-chat-attachments';
import type { ChatAttachment } from '@/features/cam/activation-detail/(helpers)/chat-attachment-utils';

const messages = {
  activationView: {
    communication: {
      removeAttachment: 'Remove {fileName}',
      fileType: '{type} file',
    },
  },
};

const attachments: ChatAttachment[] = [
  { id: 'image', kind: 'image', fileName: 'photo.webp', mimeType: 'image/webp', src: 'blob:image' },
  { id: 'pdf', kind: 'document', fileName: 'report.pdf', mimeType: 'application/pdf', src: 'blob:pdf' },
];

describe('PendingChatAttachments', () => {
  it('offers only a remove action for pending images and documents', () => {
    const onRemove = vi.fn();
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <PendingChatAttachments attachments={attachments} onRemove={onRemove} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole('img', { name: 'photo.webp' })).toBeInTheDocument();
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /preview/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove report.pdf' }));
    expect(onRemove).toHaveBeenCalledWith('pdf');
  });
});
