import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatMessageContent } from '@/features/cam/activation-detail/(components)/activation-communication/chat-message-content';
import { downloadFile } from '@/lib/download-file';

vi.mock('@/lib/download-file', () => ({ downloadFile: vi.fn() }));
vi.mock('@/shared/components/ui/media-lightbox', () => ({
  MediaLightbox: ({ open, index }: { open: boolean; index: number }) =>
    open ? <div data-testid="lightbox">Image {index}</div> : null,
}));

const messages = {
  activationView: {
    communication: {
      downloadAttachment: 'Download {fileName}',
      previewAttachment: 'Preview {fileName}',
      fileType: '{type} file',
    },
  },
};

const content = [
  '<div data-chat-attachments="true">',
  '<img data-chat-attachment="image" data-attachment-id="image-1" data-file-name="photo.webp" data-mime-type="image%2Fwebp" src="https://cdn.test/photo.webp" alt="photo.webp" />',
  '<a data-chat-attachment="document" data-attachment-id="document-1" data-file-name="report.pdf" data-mime-type="application%2Fpdf" href="https://cdn.test/report.pdf">report.pdf</a>',
  '</div><p>Hello</p>',
].join('');

describe('ChatMessageContent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('previews a received image and downloads it without opening the lightbox', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ChatMessageContent content={content} />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Download photo.webp' }));
    expect(downloadFile).toHaveBeenCalledWith('https://cdn.test/photo.webp', 'photo.webp');
    expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Preview photo.webp' }));
    expect(screen.getByTestId('lightbox')).toHaveTextContent('Image 0');
  });

  it('downloads a received document when its card is activated', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ChatMessageContent content={content} />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Download report.pdf' }));
    expect(downloadFile).toHaveBeenCalledWith('https://cdn.test/report.pdf', 'report.pdf');
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
