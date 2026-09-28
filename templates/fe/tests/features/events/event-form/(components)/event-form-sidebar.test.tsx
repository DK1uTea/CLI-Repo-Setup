import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventFormSidebar } from '@/features/events/event-form/(components)/event-form-sidebar';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';
import { useUnsavedChanges } from '@/shared/hooks/common/use-unsaved-changes';

const { eventActions, eventStepDetail, orderCancelGuard, orderReactivateGuard, cartChangedGuard, useEventOrderCancelGuardMock, useEventOrderReactivateGuardMock, useCartChangedGuardMock } = vi.hoisted(() => ({
  eventActions: { currentStep: 'logistics', goToStep: vi.fn() },
  eventStepDetail: { data: undefined as unknown, isLoading: false },
  orderCancelGuard: {
    cancelled: false,
    setCancelled: vi.fn(),
  },
  orderReactivateGuard: {
    open: false,
    isPending: false,
    isCreatingOrder: false,
    stay: vi.fn(),
    confirmReactivate: vi.fn(),
    confirmCreateOrder: vi.fn(),
  },
  cartChangedGuard: {
    open: false,
    isPending: false,
    leaveEvent: vi.fn(),
    stay: vi.fn(),
    confirmCreateOrder: vi.fn(),
  },
  useEventOrderCancelGuardMock: vi.fn(),
  useEventOrderReactivateGuardMock: vi.fn(),
  useCartChangedGuardMock: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => ['event-1', vi.fn()] }));
vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/en/events/update-event',
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({ useEventDetailStore: () => ({ canEdit: true, status: null }) }));
vi.mock('@/features/calendar/calendar-event-form/(hooks)/use-submit-calendar-event', () => ({ useSubmitCalendarEvent: () => ({ submit: vi.fn(), isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-event-actions', () => ({ useEventActions: () => eventActions }));
vi.mock('@/features/events/event-form/(hooks)/use-event-order-cancel-guard', () => ({
  useEventOrderCancelGuard: useEventOrderCancelGuardMock,
}));
vi.mock('@/features/events/event-form/(hooks)/use-event-order-reactivate-guard', () => ({
  useEventOrderReactivateGuard: useEventOrderReactivateGuardMock,
}));
vi.mock('@/features/events/event-form/(hooks)/use-cart-changed-guard', () => ({
  useCartChangedGuard: useCartChangedGuardMock,
}));
vi.mock('@/features/events/event-form/(hooks)/use-event-visibility', () => ({
  useEventVisibility: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-event-form-footer', () => ({
  useEventFormFooter: () => ({ onNext: vi.fn(), isPending: false }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-get-event-type', () => ({
  useGetEventType: () => ({ eventTypes: [] }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-event-step-detail', () => ({
  useEventStepDetail: () => ({
    data: eventStepDetail.data,
    isLoading: eventStepDetail.isLoading,
  }),
}));

function SidebarHarness({
  defaultValues = {},
  variant,
  withUnsavedChanges = false,
}: {
  defaultValues?: Partial<EventFormDto>;
  variant?: 'events' | 'calendar';
  withUnsavedChanges?: boolean;
}) {
  const methods = useForm<EventFormDto>({ defaultValues: defaultValues as Partial<EventFormDto> });
  return (
    <FormProvider {...methods}>
      <EventFormSidebar mode="create" variant={variant} />
      {withUnsavedChanges && <DirtyFormGuard />}
    </FormProvider>
  );
}

function DirtyFormGuard() {
  const methods = useFormContext<EventFormDto>();
  const { dialogProps } = useUnsavedChanges({
    isDirty: true,
    onDiscard: () => methods.reset(),
  });

  return (
    <>
      <output aria-label="Unsaved dialog open">{String(dialogProps.isOpen)}</output>
      <button type="button" onClick={dialogProps.onLeave}>Leave without saving</button>
    </>
  );
}

describe('EventFormSidebar', () => {
  beforeEach(() => {
    eventActions.currentStep = 'logistics';
    eventActions.goToStep.mockReset();
    eventStepDetail.data = undefined;
    eventStepDetail.isLoading = false;
    orderCancelGuard.cancelled = false;
    orderReactivateGuard.open = false;
    orderReactivateGuard.isPending = false;
    orderReactivateGuard.isCreatingOrder = false;
    useEventOrderCancelGuardMock.mockReset();
    useEventOrderCancelGuardMock.mockReturnValue(orderCancelGuard);
    useEventOrderReactivateGuardMock.mockReset();
    useEventOrderReactivateGuardMock.mockReturnValue(orderReactivateGuard);
    useCartChangedGuardMock.mockReset();
    useCartChangedGuardMock.mockReturnValue(cartChangedGuard);
  });

  it('enables the active-order cancel guard on the events variant', () => {
    render(<SidebarHarness variant="events" />);

    expect(useEventOrderCancelGuardMock).toHaveBeenCalledWith('event-1', true);
  });

  it('disables the active-order cancel guard on the calendar variant — no product step to guard', () => {
    render(<SidebarHarness variant="calendar" />);

    expect(useEventOrderCancelGuardMock).toHaveBeenCalledWith('event-1', false);
  });

  it('names Calendar back links after their Calendar destination', () => {
    render(<SidebarHarness variant="calendar" />);

    expect(screen.getAllByRole('link', { name: 'backToCalendar' })).toHaveLength(2);
    expect(screen.queryByRole('link', { name: 'backToEvents' })).not.toBeInTheDocument();
  });

  it('blocks future steps but keeps previous steps available during create flow', () => {
    render(<SidebarHarness />);

    expect(screen.getByRole('button', { name: '1' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '3' })).toBeDisabled();
  });

  it('navigates directly when a step is clicked', async () => {
    const user = userEvent.setup();
    render(<SidebarHarness />);

    const overviewCard = screen.getAllByText('steps.overview')[0];
    await user.click(overviewCard);

    expect(eventActions.goToStep).toHaveBeenCalledWith('overview');
  });

  it('asks before changing sidebar steps when the current form has unsaved changes', async () => {
    const user = userEvent.setup();
    render(<SidebarHarness withUnsavedChanges />);

    await user.click(screen.getAllByText('steps.overview')[0]);

    expect(screen.getByRole('status', { name: 'Unsaved dialog open' })).toHaveTextContent('true');
    expect(eventActions.goToStep).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Leave without saving' }));

    expect(eventActions.goToStep).toHaveBeenCalledWith('overview');
  });

  it('renders the order-choice dialog when the missing-order guard is active', () => {
    orderCancelGuard.cancelled = true;
    orderReactivateGuard.open = true;
    render(<SidebarHarness />);

    expect(screen.getByTestId('event-form-order-choice-stay-button')).toBeInTheDocument();
    expect(screen.getByTestId('event-form-order-choice-create-button')).toBeInTheDocument();
    expect(screen.getByTestId('event-form-order-choice-reactivate-button')).toBeInTheDocument();
  });

  it('formats the event start date as "Sat, Aug 15, 2026, 9:00 AM"', () => {
    render(
      <SidebarHarness
        defaultValues={{ startDate: '2026-08-15', startTime: '09:00' }}
      />,
    );

    expect(screen.getAllByText('Sat, Aug 15, 2026, 9:00 AM')[0]).toBeInTheDocument();
  });

  it('restores sidebar information from step-detail general data after reloading a later step', () => {
    eventStepDetail.data = {
      general: {
        id: 'event-1',
        name: 'Reloaded event',
        customEventId: 'EVENT-12345678',
        startTime: '2026-08-15T09:00:00.000Z',
        status: 'DRAFT',
      },
    };

    render(<SidebarHarness />);

    expect(screen.getAllByText('Reloaded event')[0]).toBeInTheDocument();
    expect(screen.getByText('ID: EVENT-12345678')).toBeInTheDocument();
    expect(screen.getAllByText('Sat, Aug 15, 2026, 9:00 AM')[0]).toBeInTheDocument();
    expect(screen.getAllByText('status.DRAFT')[0]).toBeInTheDocument();
  });

  it('does not replace an empty Overview form value with stale general data', () => {
    eventActions.currentStep = 'overview';
    eventStepDetail.data = {
      general: {
        id: 'event-1',
        name: 'Persisted event',
        customEventId: 'EVENT-12345678',
        startTime: '2026-08-15T09:00:00.000Z',
      },
    };

    render(<SidebarHarness />);

    expect(screen.queryAllByText('Persisted event')).toHaveLength(0);
    expect(screen.getAllByText('eventNameLabel')[0]).toBeInTheDocument();
  });

  it('shows sidebar information skeletons instead of the Event Name fallback while general data loads', () => {
    eventStepDetail.isLoading = true;

    const { container } = render(<SidebarHarness />);

    expect(screen.queryAllByText('eventNameLabel')).toHaveLength(0);
    expect(container.querySelectorAll('[data-sidebar-info-skeleton]').length)
      .toBeGreaterThan(0);
  });
});
