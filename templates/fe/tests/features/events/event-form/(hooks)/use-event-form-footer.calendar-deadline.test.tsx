import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useEventFormFooter } from '@/features/events/event-form/(hooks)/use-event-form-footer';

const { eventActions } = vi.hoisted(() => ({
  eventActions: {
    currentStep: 'overview',
    isFirstStep: true,
    isLastStep: false,
    goToPrevStep: vi.fn(),
    goToNextStep: vi.fn(),
  },
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: { withDefault: () => ({}) }, useQueryState: () => [null, vi.fn()] }));
vi.mock('@/i18n/navigation', () => ({ usePathname: () => '/calendar-dashboard/new-calendar-event', useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/features/events/(stores)/use-event-cart-store', () => ({ useEventCartStore: () => ({ cart: [] }) }));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({ useEventDetailStore: () => true }));
vi.mock('@/features/events/event-form/(hooks)/use-event-actions', () => ({ useEventActions: () => eventActions }));
const { useEventDeadlineMock } = vi.hoisted(() => ({ useEventDeadlineMock: vi.fn() }));
vi.mock('@/features/events/event-form/(hooks)/use-event-deadline', () => ({ useEventDeadline: useEventDeadlineMock }));
vi.mock('@/features/events/event-form/(hooks)/use-submit-step-overview', () => ({ useSubmitStepOverview: () => ({ submit: vi.fn(), isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-submit-step-logistics', () => ({ useSubmitStepLogistics: () => ({ submit: vi.fn(), isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-submit-step-helping-hands', () => ({ useSubmitStepHelpingHands: () => ({ submit: vi.fn(), isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-submit-event', () => ({ useSubmitEvent: () => ({ submitEvent: vi.fn(), isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-delete-event', () => ({ useDeleteEvent: () => ({ deleteEvent: vi.fn(), isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-duplicate-event', () => ({ useDuplicateEvent: () => ({ duplicate: vi.fn(), isPending: false }) }));

function FooterState() {
  const { isDeadlineBlocked } = useEventFormFooter('calendar');
  return <output data-testid="is-deadline-blocked">{String(isDeadlineBlocked)}</output>;
}

describe('useEventFormFooter on the calendar variant', () => {
  it('enables the deadline lookup on the overview step, same as the events variant', () => {
    useEventDeadlineMock.mockReturnValue({ isError: false, isLoading: false });
    eventActions.currentStep = 'overview';
    render(<FooterState />);

    expect(useEventDeadlineMock).toHaveBeenCalledWith(true);
  });

  it('blocks Next on the overview step when the deadline lookup fails, same as the events variant', () => {
    useEventDeadlineMock.mockReturnValue({ isError: true, isLoading: false });
    eventActions.currentStep = 'overview';
    render(<FooterState />);

    expect(screen.getByTestId('is-deadline-blocked')).toHaveTextContent('true');
  });
});
