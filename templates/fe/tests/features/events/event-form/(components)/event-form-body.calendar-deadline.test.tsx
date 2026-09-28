import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EventFormBody } from '@/features/events/event-form/(components)/event-form-body';

const { detailStore } = vi.hoisted(() => ({
  detailStore: {
    isFormLoading: false,
    canEdit: true,
    setAllowEdit: vi.fn(),
    setCanEdit: vi.fn(),
    setStatus: vi.fn(),
    setIsOverviewLocked: vi.fn(),
  },
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => [null, vi.fn()] }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
vi.mock('@/shared/stores/use-user-store', () => ({ useHasPermission: () => false }));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({ useEventDetailStore: () => detailStore }));
vi.mock('@/features/events/event-form/(hooks)/use-event-actions', () => ({ useEventActions: () => ({ currentStep: 'overview' }) }));
const { useEventDeadlineMock } = vi.hoisted(() => ({ useEventDeadlineMock: vi.fn(() => ({ isError: false, isLoading: true })) }));
vi.mock('@/features/events/event-form/(hooks)/use-event-deadline', () => ({ useEventDeadline: useEventDeadlineMock }));
vi.mock('@/features/events/event-form/(hooks)/use-event-step-detail', () => ({ useEventStepDetail: () => ({ data: undefined }) }));
vi.mock('@/features/calendar/event-calendar-detail/(hooks)/use-calendar-event-detail', () => ({ useCalendarEventDetail: () => ({ data: undefined }) }));
vi.mock('@/features/events/event-form/(hooks)/use-sync-event-cart', () => ({ useSyncEventCart: () => {} }));
vi.mock('@/features/events/event-form/(components)/event-form-sidebar', () => ({ EventFormSidebar: () => null }));
vi.mock('@/features/events/event-form/(components)/steps/event-form-step-overview', () => ({
  EventFormStepOverview: () => <button type="button">Overview editor</button>,
}));
vi.mock('@/features/events/event-form/(components)/steps/event-form-step-overview/overview-skeleton', () => ({
  OverviewSkeleton: () => <div data-testid="overview-skeleton" />,
}));

describe('EventFormBody on the calendar variant', () => {
  it('enables the deadline lookup on the overview step, same as the events variant', () => {
    render(<EventFormBody mode="create" variant="calendar" />);

    expect(useEventDeadlineMock).toHaveBeenCalledWith(true);
  });

  it('shows the overview skeleton while the deadline lookup is loading, same as the events variant', () => {
    render(<EventFormBody mode="create" variant="calendar" />);

    expect(screen.getByTestId('overview-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Overview editor' })).not.toBeInTheDocument();
  });
});
