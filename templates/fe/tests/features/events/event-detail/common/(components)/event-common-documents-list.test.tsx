import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventCommonDocumentsList } from '@/features/events/event-detail/common/(components)/event-common-documents-list';

const { useEventTasksMock } = vi.hoisted(() => ({ useEventTasksMock: vi.fn() }));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { page?: number }) =>
    values?.page ? `${key} ${values.page}` : key,
}));
vi.mock('@/features/events/event-detail/common/(hooks)/use-event-tasks', () => ({
  useEventTasks: useEventTasksMock,
}));
vi.mock('@/features/events/event-detail/common/(hooks)/use-delete-event-task', () => ({
  useDeleteEventTask: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('@/features/events/event-detail/common/(components)/event-common-proof-item', () => ({
  PROOF_SERVICES: [],
  ProofItemSkeleton: () => null,
  ProofItemCard: ({ task }: { task: { id: string } }) => <div>{task.id}</div>,
}));

describe('EventCommonDocumentsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useEventTasksMock.mockReturnValue({
      data: {
        tasks: [{ id: 'task-1' }],
        pagination: {
          total: 21,
          limit: 10,
          page: 1,
          totalPages: 3,
          hasNextPage: true,
          hasPrevPage: false,
        },
      },
      isFetching: false,
    });
  });

  it('renders the shared pagination and fetches the selected page', () => {
    render(<EventCommonDocumentsList eventId="event-1" namespace="eventDetail" />);

    expect(screen.getByRole('navigation', { name: 'label' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'goToPage 2' }));

    expect(useEventTasksMock).toHaveBeenLastCalledWith(expect.objectContaining({
      eventId: 'event-1',
      page: 2,
      limit: 10,
    }));
  });
});
