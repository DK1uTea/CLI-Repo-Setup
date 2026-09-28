import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EventFormBody } from '@/features/events/event-form/(components)/event-form-body';

const { detailStore, stepState, stepDetailCalls, syncCartCalls, overviewProps, calendarDetail } = vi.hoisted(() => ({
  detailStore: {
    isFormLoading: false,
    canEdit: true,
    setAllowEdit: vi.fn(),
    setCanEdit: vi.fn(),
    setStatus: vi.fn(),
    setIsOverviewLocked: vi.fn(),
  },
  stepState: { current: 'logistics' },
  stepDetailCalls: [] as unknown[][],
  syncCartCalls: [] as unknown[][],
  overviewProps: [] as unknown[],
  calendarDetail: { data: undefined as undefined | Record<string, unknown> },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => ['4adc3ca8-49ed-4a58-a838-b5339161e78e', vi.fn()],
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

vi.mock('@/shared/stores/use-user-store', () => ({ useHasPermission: () => false }));

vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: () => detailStore,
}));

vi.mock('@/features/events/event-form/(hooks)/use-event-actions', () => ({
  useEventActions: () => ({ currentStep: stepState.current }),
}));

vi.mock('@/features/events/event-form/(hooks)/use-event-deadline', () => ({
  useEventDeadline: () => ({ isError: false, isLoading: false }),
}));

vi.mock('@/features/events/event-form/(hooks)/use-event-step-detail', () => ({
  useEventStepDetail: (eventId: string, step: unknown) => {
    stepDetailCalls.push([eventId, step]);
    if (!eventId) return { data: undefined };
    return {
      data: {
        general: { id: '4adc3ca8-49ed-4a58-a838-b5339161e78e', status: 'DRAFT' },
        logistics: null,
        canEdit: false,
      },
    };
  },
}));

vi.mock('@/features/calendar/event-calendar-detail/(hooks)/use-calendar-event-detail', () => ({
  useCalendarEventDetail: () => ({ data: calendarDetail.data }),
}));

vi.mock('@/features/events/event-form/(hooks)/use-sync-event-cart', () => ({
  useSyncEventCart: (...args: unknown[]) => syncCartCalls.push(args),
}));

vi.mock('@/features/events/event-form/(components)/event-form-sidebar', () => ({
  EventFormSidebar: () => null,
}));

vi.mock('@/features/events/event-form/(components)/steps/event-form-step-logistics', () => ({
  EventFormStepLogistics: () => <button type="button">Logistics editor</button>,
}));

vi.mock('@/features/events/event-form/(components)/steps/event-form-step-product-catalog', () => ({
  EventFormStepProductCatalog: () => <button type="button">Product catalog editor</button>,
}));

vi.mock('@/features/events/event-form/(components)/steps/event-form-step-overview', () => ({
  EventFormStepOverview: (props: unknown) => {
    overviewProps.push(props);
    return <div>Overview editor</div>;
  },
}));

describe('EventFormBody', () => {
  it('locks an existing Event form when the step-detail API returns canEdit false', () => {
    stepState.current = 'logistics';
    render(<EventFormBody mode="update" />);

    expect(screen.getByRole('button', { name: 'Logistics editor' })).toBeDisabled();
  });

  it('fetches Helping Hands detail on the Product Catalog step and locks from that canEdit', () => {
    stepState.current = 'product_catalog';
    stepDetailCalls.length = 0;

    render(<EventFormBody mode="update" />);

    expect(stepDetailCalls).toEqual([
      ['4adc3ca8-49ed-4a58-a838-b5339161e78e', 'helping_hand'],
    ]);
    expect(screen.getByRole('button', { name: 'Product catalog editor' })).toBeDisabled();
  });

  it('leaves cart synchronization to the shared cart component', () => {
    syncCartCalls.length = 0;

    render(<EventFormBody mode="update" />);

    expect(syncCartCalls).toEqual([]);
  });

  it('passes the calendar variant to the overview save-and-leave handler', () => {
    stepState.current = 'overview';
    overviewProps.length = 0;

    render(<EventFormBody mode="create" variant="calendar" />);

    expect(overviewProps).toContainEqual(
      expect.objectContaining({ variant: 'calendar' }),
    );
  });

  it('uses Calendar ownership instead of the Event canEdit flag', () => {
    stepState.current = 'overview';
    calendarDetail.data = { id: 'event-1', isOwner: true, canEdit: false };
    detailStore.setCanEdit.mockClear();

    render(<EventFormBody mode="update" variant="calendar" />);

    expect(detailStore.setCanEdit).toHaveBeenCalledWith(true);
    calendarDetail.data = undefined;
  });
});
