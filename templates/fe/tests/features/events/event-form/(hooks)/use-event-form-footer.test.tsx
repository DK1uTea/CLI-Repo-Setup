import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEventFormFooter } from '@/features/events/event-form/(hooks)/use-event-form-footer';

const { eventActions, routerPush, submitOverview, submitLogistics, submitHelpingHands, submitEvent, toastSuccess } = vi.hoisted(() => ({
  eventActions: {
    currentStep: 'helping_hand',
    isFirstStep: false,
    isLastStep: false,
    goToPrevStep: vi.fn(),
    goToNextStep: vi.fn(),
  },
  routerPush: vi.fn(),
  submitOverview: vi.fn(),
  submitLogistics: vi.fn(),
  submitHelpingHands: vi.fn().mockResolvedValue(true),
  submitEvent: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: { withDefault: () => ({}) }, useQueryState: () => ['event-1', vi.fn()] }));
vi.mock('@/i18n/navigation', () => ({ usePathname: () => '/events/new-event', useRouter: () => ({ push: routerPush }) }));
vi.mock('sonner', () => ({ toast: { success: toastSuccess } }));
vi.mock('@/features/events/(stores)/use-event-cart-store', () => ({ useEventCartStore: () => ({ cart: [] }) }));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({ useEventDetailStore: () => true }));
vi.mock('@/features/events/event-form/(hooks)/use-event-actions', () => ({ useEventActions: () => eventActions }));
vi.mock('@/features/events/event-form/(hooks)/use-event-deadline', () => ({ useEventDeadline: () => ({ isError: false, isLoading: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-submit-step-overview', () => ({ useSubmitStepOverview: () => ({ submit: submitOverview, isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-submit-step-logistics', () => ({ useSubmitStepLogistics: () => ({ submit: submitLogistics, isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-submit-step-helping-hands', () => ({ useSubmitStepHelpingHands: () => ({ submit: submitHelpingHands, isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-submit-event', () => ({ useSubmitEvent: () => ({ submitEvent, isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-delete-event', () => ({ useDeleteEvent: () => ({ deleteEvent: vi.fn(), isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-duplicate-event', () => ({ useDuplicateEvent: () => ({ duplicate: vi.fn(), isPending: false }) }));

function FooterState() {
  const { isCartEmptyStep, onConfirmDraft } = useEventFormFooter('events');
  return (
    <>
      <output data-testid="is-cart-empty-step">{String(isCartEmptyStep)}</output>
      <button type="button" onClick={onConfirmDraft}>Save draft</button>
    </>
  );
}

describe('useEventFormFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows Next from Helping Hands when no product is selected', () => {
    eventActions.currentStep = 'helping_hand';
    render(<FooterState />);

    expect(screen.getByTestId('is-cart-empty-step')).toHaveTextContent('false');
  });

  it('still requires a product before leaving Product Catalog', () => {
    eventActions.currentStep = 'product_catalog';
    render(<FooterState />);

    expect(screen.getByTestId('is-cart-empty-step')).toHaveTextContent('true');
  });

  it('redirects to the uppercase DRAFT status after saving a draft', async () => {
    eventActions.currentStep = 'helping_hand';
    render(<FooterState />);

    await act(async () => screen.getByRole('button', { name: 'Save draft' }).click());

    expect(routerPush).toHaveBeenCalledWith('/events?status=DRAFT');
  });

  it.each(['product_catalog', 'summary'] as const)(
    'redirects with a success toast and no API call when saving a draft on %s',
    async (step) => {
      eventActions.currentStep = step;
      render(<FooterState />);

      await act(async () => screen.getByRole('button', { name: 'Save draft' }).click());

      expect(toastSuccess).toHaveBeenCalledWith('draftSaveSuccess');
      expect(submitOverview).not.toHaveBeenCalled();
      expect(submitLogistics).not.toHaveBeenCalled();
      expect(submitHelpingHands).not.toHaveBeenCalled();
      expect(submitEvent).not.toHaveBeenCalled();
      expect(eventActions.goToNextStep).not.toHaveBeenCalled();
      expect(routerPush).toHaveBeenCalledWith('/events?status=DRAFT');
    },
  );
});
