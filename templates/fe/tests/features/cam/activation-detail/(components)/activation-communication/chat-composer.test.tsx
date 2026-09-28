import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ChatComposer from '@/features/cam/activation-detail/(components)/activation-communication/chat-composer';

const mocks = vi.hoisted(() => ({
  uploadFiles: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/features/cam/activation-form/(hooks)/use-activation-media-upload', () => ({
  useActivationMediaUpload: () => ({ uploadFiles: mocks.uploadFiles, isUploading: false }),
}));
vi.mock('sonner', () => ({ toast: { error: mocks.toastError } }));
vi.mock('@/shared/components/ui/editor', () => ({
  Editor: ({
    attachmentContent,
    onFilesSelected,
    fileInputLabel,
  }: {
    attachmentContent?: ReactNode;
    onFilesSelected?: (files: File[]) => void;
    fileInputLabel?: string;
  }) => (
    <div>
      <input
        aria-label={fileInputLabel}
        type="file"
        multiple
        onChange={(event) => onFilesSelected?.(Array.from(event.currentTarget.files ?? []))}
      />
      {attachmentContent}
    </div>
  ),
}));

const messages = {
  activationView: {
    communication: {
      cancel: 'Cancel',
      selectAttachments: 'Select attachments',
      removeAttachment: 'Remove {fileName}',
      fileType: '{type} file',
      unsupportedFile: '{fileName} is not supported.',
      fileTooLarge: '{fileName} is too large.',
      tooManyFiles: 'A message can contain up to 5 files.',
      attachmentUploadFailed: 'Failed to upload attachments.',
    },
  },
};

function renderComposer(onSubmit = vi.fn()) {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ChatComposer participants={[]} submitLabel="Save" onSubmit={onSubmit} />
    </NextIntlClientProvider>,
  );
  return onSubmit;
}

describe('ChatComposer attachments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn((selected: File) => `blob:${selected.name}`),
      revokeObjectURL: vi.fn(),
    });
  });

  it('uploads a document before submitting its CDN-backed HTML', async () => {
    const onSubmit = renderComposer();
    const selected = new File(['pdf'], 'report.pdf', { type: 'application/pdf' });
    mocks.uploadFiles.mockResolvedValue([{ key: 'chat/report.pdf', cdnUrl: 'https://cdn.test/report.pdf' }]);

    fireEvent.change(screen.getByLabelText('Select attachments'), { target: { files: [selected] } });
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(mocks.uploadFiles).toHaveBeenCalledWith([selected]);
    expect(onSubmit.mock.calls[0][0]).toContain('data-chat-attachment="document"');
    expect(onSubmit.mock.calls[0][0]).toContain('href="https://cdn.test/report.pdf"');
    expect(screen.queryByText('report.pdf')).not.toBeInTheDocument();
  });

  it('retains a pending attachment when upload fails', async () => {
    const onSubmit = renderComposer();
    const selected = new File(['pdf'], 'report.pdf', { type: 'application/pdf' });
    mocks.uploadFiles.mockRejectedValue(new Error('S3 failed'));

    fireEvent.change(screen.getByLabelText('Select attachments'), { target: { files: [selected] } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('Failed to upload attachments.'));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
  });

  it('rejects unsupported, oversized and excess attachments with translated feedback', () => {
    renderComposer();
    const files = [
      new File(['svg'], 'vector.svg', { type: 'image/svg+xml' }),
      new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.pdf', { type: 'application/pdf' }),
      ...Array.from({ length: 6 }, (_, index) => new File(['x'], `${index}.png`, { type: 'image/png' })),
    ];

    fireEvent.change(screen.getByLabelText('Select attachments'), { target: { files } });

    expect(mocks.toastError).toHaveBeenCalledWith('vector.svg is not supported.');
    expect(mocks.toastError).toHaveBeenCalledWith('large.pdf is too large.');
    expect(mocks.toastError).toHaveBeenCalledWith('A message can contain up to 5 files.');
    expect(screen.getAllByRole('button', { name: /^Remove/ })).toHaveLength(5);
  });
});
