import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCartChangedGuard } from '@/features/events/event-form/(hooks)/use-cart-changed-guard';

/**
 * Uses the real useNavigationGuard (not mocked) to prove the suppress-bypass
 * mechanism actually lets the replayed anchor click through instead of
 * reopening the dialog — `active` (the cart divergence) never turns off on
 * its own, so this can't rely on the flushSync trick the reactivate guard
 * uses (there is no local "resolved" state to flip).
 */
const { activeCountState, cartState, eventDetailState, createOrderMock } = vi.hoisted(() => ({
  activeCountState: { data: { total: 1, haveActive: true } },
  cartState: { cart: [{ quantity: 1, actualQuantity: 0 }] },
  eventDetailState: { canEdit: true },
  createOrderMock: vi.fn(),
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/features/events/event-form/(hooks)/use-event-order-active-count', () => ({
  useEventOrderActiveCount: () => ({ data: activeCountState.data }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-create-event-order', () => ({
  useCreateEventOrder: () => ({ createOrder: createOrderMock, isPending: false }),
}));
vi.mock('@/features/events/(stores)/use-event-cart-store', () => ({
  useEventCartStore: () => ({ cart: cartState.cart }),
}));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: typeof eventDetailState) => unknown) => selector(eventDetailState),
}));

function Harness() {
  const { open, leaveEvent } = useCartChangedGuard('event-1');
  return (
    <div>
      <a href="/other-page" data-testid="link">link</a>
      <output data-testid="open">{String(open)}</output>
      <button data-testid="leave" onClick={leaveEvent}>leave</button>
    </div>
  );
}

describe('useCartChangedGuard (integration with the real navigation guard)', () => {
  it('lets the replayed navigation through after Leave event instead of reopening the dialog', () => {
    render(<Harness />);

    fireEvent.click(screen.getByTestId('link'));
    expect(screen.getByTestId('open')).toHaveTextContent('true');

    fireEvent.click(screen.getByTestId('leave'));

    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('never re-intercepts a later, unrelated click on the same link after Leave event — the guard is truly deactivated, not just once-suppressed', () => {
    render(<Harness />);

    fireEvent.click(screen.getByTestId('link'));
    fireEvent.click(screen.getByTestId('leave'));
    expect(screen.getByTestId('open')).toHaveTextContent('false');

    // A fresh click, unrelated to the replay chain above. With a
    // once-only "suppress the next interception" flag (the earlier, broken
    // implementation) this would still be blocked and reopen the dialog,
    // since the underlying cart divergence never clears itself.
    fireEvent.click(screen.getByTestId('link'));

    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });
});
