import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEventFormFooter } from '@/features/events/event-form/(hooks)/use-event-form-footer';

const { eventActions, cartState, eventDetailState, submitEventMock } = vi.hoisted(() => ({
  eventActions: {
    currentStep: 'product_catalog' as string,
    isFirstStep: false,
    isLastStep: false,
    goToPrevStep: vi.fn(),
    goToNextStep: vi.fn(),
  },
  cartState: { cart: [] as { quantity: number; actualQuantity?: number }[] },
  eventDetailState: { canEdit: true, status: 'ACTIVE' as string | null },
  submitEventMock: vi.fn(),
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: { withDefault: () => ({}) }, useQueryState: () => ['event-1', vi.fn()] }));
vi.mock('@/i18n/navigation', () => ({ usePathname: () => '/events/update-event', useRouter: () => ({ push: vi.fn() }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));
vi.mock('@/features/events/(stores)/use-event-cart-store', () => ({ useEventCartStore: () => cartState }));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: typeof eventDetailState) => unknown) => selector(eventDetailState),
}));
vi.mock('@/features/events/event-form/(hooks)/use-event-actions', () => ({ useEventActions: () => eventActions }));
vi.mock('@/features/events/event-form/(hooks)/use-event-deadline', () => ({ useEventDeadline: () => ({ isError: false, isLoading: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-submit-step-overview', () => ({ useSubmitStepOverview: () => ({ submit: vi.fn(), isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-submit-step-logistics', () => ({ useSubmitStepLogistics: () => ({ submit: vi.fn(), isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-submit-step-helping-hands', () => ({ useSubmitStepHelpingHands: () => ({ submit: vi.fn(), isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-submit-event', () => ({ useSubmitEvent: () => ({ submit: submitEventMock, isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-delete-event', () => ({ useDeleteEvent: () => ({ deleteEvent: vi.fn(), isPending: false }) }));
vi.mock('@/features/events/event-form/(hooks)/use-duplicate-event', () => ({ useDuplicateEvent: () => ({ duplicate: vi.fn(), isPending: false }) }));

function FooterState() {
  const { hasCartChanges, onFinalizeEvent } = useEventFormFooter('events');
  return (
    <>
      <output data-testid="has-cart-changes">{String(hasCartChanges)}</output>
      <button type="button" onClick={onFinalizeEvent}>Finalize</button>
    </>
  );
}

describe('useEventFormFooter — Finalize event', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cartState.cart = [];
    eventActions.currentStep = 'product_catalog';
    eventDetailState.canEdit = true;
    eventDetailState.status = 'ACTIVE';
  });

  it('is false when the cart has no order changes', () => {
    cartState.cart = [{ quantity: 2, actualQuantity: 2 }];
    render(<FooterState />);

    expect(screen.getByTestId('has-cart-changes')).toHaveTextContent('false');
  });

  it('is true on a cart step when an item is new, deleted, or changed relative to the order', () => {
    cartState.cart = [{ quantity: 1, actualQuantity: 0 }];
    render(<FooterState />);

    expect(screen.getByTestId('has-cart-changes')).toHaveTextContent('true');
  });

  it('is false outside the cart steps even when the cart has changes', () => {
    eventActions.currentStep = 'logistics';
    cartState.cart = [{ quantity: 1, actualQuantity: 0 }];
    render(<FooterState />);

    expect(screen.getByTestId('has-cart-changes')).toHaveTextContent('false');
  });

  it('calls the same submit-event API the summary step uses when finalizing', async () => {
    cartState.cart = [{ quantity: 1, actualQuantity: 0 }];
    render(<FooterState />);

    await act(async () => screen.getByRole('button', { name: 'Finalize' }).click());

    expect(submitEventMock).toHaveBeenCalledTimes(1);
  });

  it('is false on a DRAFT event even with cart changes on a cart step — a DRAFT event was never ordered', () => {
    eventDetailState.status = 'DRAFT';
    cartState.cart = [{ quantity: 1, actualQuantity: 0 }];
    render(<FooterState />);

    expect(screen.getByTestId('has-cart-changes')).toHaveTextContent('false');
  });
});
