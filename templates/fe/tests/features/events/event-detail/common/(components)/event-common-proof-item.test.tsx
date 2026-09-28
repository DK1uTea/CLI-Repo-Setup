import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import { ProofItemCard } from '@/features/events/event-detail/common/(components)/event-common-proof-item';
import messages from '@/messages/en.json';

const downloadMocks = vi.hoisted(() => ({
  downloadFile: vi.fn(),
  downloadFilesAsZip: vi.fn(),
}));

vi.mock('@/shared/stores/use-user-store', () => ({ useDateFormat: () => 'DD.MM.YYYY' }));
vi.mock('@/shared/components/common/component-guard', () => ({
  ComponentGuard: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/lib/download-file', () => downloadMocks);
vi.mock('@/shared/components/ui/media-lightbox', () => ({
  MediaLightbox: ({
    open,
    items,
  }: {
    open: boolean;
    items: { alt?: string }[];
  }) => (open ? <div role="dialog">{items.map((item) => item.alt).join(', ')}</div> : null),
}));

const baseTask = {
  id: 'task-1',
  eventId: 'event-1',
  service: 'OTHER',
  createdAt: '2026-08-04T10:00:00.000Z',
};

const multiFileTask = {
  ...baseTask,
  comment: 'Need both files',
  files: ['https://cdn.test/first.pdf', 'https://cdn.test/photo.jpg'],
};

function renderCard(task: Record<string, unknown>) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ProofItemCard
        task={task as never}
        namespace="eventDetail"
        onDelete={vi.fn()}
      />
    </NextIntlClientProvider>,
  );
}

describe('ProofItemCard', () => {
  it('keeps the comment and every file in the same document row', () => {
    renderCard(multiFileTask);

    expect(screen.getByText('Need both files')).toBeInTheDocument();
    expect(screen.getByText('first.pdf')).toBeInTheDocument();
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Download documents' })).not.toBeInTheDocument();
  });

  it('opens an image preview instead of downloading when a file icon is clicked', () => {
    renderCard(multiFileTask);

    fireEvent.click(screen.getByRole('button', { name: 'Preview photo.jpg' }));

    expect(downloadMocks.downloadFile).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toHaveTextContent('photo.jpg');
  });

  it('opens a non-image file in a new tab for preview', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderCard(multiFileTask);

    fireEvent.click(screen.getByRole('button', { name: 'Preview first.pdf' }));

    expect(downloadMocks.downloadFile).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledWith('https://cdn.test/first.pdf', '_blank', 'noopener,noreferrer');
    open.mockRestore();
  });

  it('allows deletion when the API returns canDelete true', () => {
    const onDelete = vi.fn();
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ProofItemCard
          task={{ ...baseTask, canDelete: true } as never}
          namespace="eventDetail"
          onDelete={onDelete}
        />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete document' }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'task-1' }));
  });

  it('disables deletion when canDelete is false', () => {
    renderCard({ ...baseTask, canDelete: false });

    expect(screen.getByRole('button', { name: 'Delete document' })).toBeDisabled();
  });
});
