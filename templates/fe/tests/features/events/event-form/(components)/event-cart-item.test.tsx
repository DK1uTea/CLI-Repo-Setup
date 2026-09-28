import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventCartItem } from '@/features/events/event-form/(components)/event-cart-item';
import type { CartItem } from '@/features/events/(stores)/use-event-cart-store';

const { eventDetailState, activeOrderCountState } = vi.hoisted(() => ({
  eventDetailState: { status: 'ACTIVE' as string | null },
  activeOrderCountState: { data: { total: 1, haveActive: true } as { total: number; haveActive: boolean } | undefined },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === 'activeOrderUnits') return `Active order: ${values?.count} unit(s)`;
    return key;
  },
}));
vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => ['event-1'],
}));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: typeof eventDetailState) => unknown) => selector(eventDetailState),
}));
vi.mock('@/features/events/event-form/(hooks)/use-event-order-active-count', () => ({
  useEventOrderActiveCount: () => ({ data: activeOrderCountState.data }),
}));

const baseItem: CartItem = {
  id: 'item-1',
  name: 'Theke ROKA 2,0m schwarz Coca-Cola',
  thumbnail: '',
  quantity: 1,
  price: 49.5,
  isRental: true,
  maxQuantity: 9999,
};

const baseProps = {
  onDelete: vi.fn(),
  onIncrease: vi.fn(),
  onDecrease: vi.fn(),
  onSubmitQuantity: vi.fn(),
};

function EditableQuantityHarness({ onSubmit }: { onSubmit: (quantity: number) => void }) {
  const [quantity, setQuantity] = useState(2);

  const handleSubmit = (nextQuantity: number) => {
    setQuantity(nextQuantity);
    onSubmit(nextQuantity);
  };

  return (
    <>
      <EventCartItem
        item={{ ...baseItem, quantity }}
        {...baseProps}
        onSubmitQuantity={handleSubmit}
      />
      <output aria-label="Committed quantity">{quantity}</output>
    </>
  );
}

describe('EventCartItem — order/cart state indicators', () => {
  beforeEach(() => {
    eventDetailState.status = 'ACTIVE';
    activeOrderCountState.data = { total: 1, haveActive: true };
  });

  it('shows the active-order units text whenever actualQuantity is greater than 0', () => {
    render(<EventCartItem item={{ ...baseItem, quantity: 1, actualQuantity: 2 }} {...baseProps} />);

    expect(screen.getByText('Active order: 2 unit(s)')).toBeInTheDocument();
  });

  it('always renders the Active order text in destructive color, regardless of the badge state', () => {
    render(<EventCartItem item={{ ...baseItem, quantity: 3, actualQuantity: 2 }} {...baseProps} />);

    expect(screen.getByText('Active order: 2 unit(s)')).toHaveClass('text-destructive');
  });

  it('does not show the active-order units text when actualQuantity is 0', () => {
    render(<EventCartItem item={{ ...baseItem, quantity: 1, actualQuantity: 0 }} {...baseProps} />);

    expect(screen.queryByText(/Active order:/)).not.toBeInTheDocument();
  });

  it('does not show the active-order units text when actualQuantity is undefined', () => {
    render(<EventCartItem item={{ ...baseItem, quantity: 1 }} {...baseProps} />);

    expect(screen.queryByText(/Active order:/)).not.toBeInTheDocument();
  });

  it('marks a newly-added, not-yet-ordered item with the success style and a New badge', () => {
    render(<EventCartItem item={{ ...baseItem, quantity: 1, actualQuantity: 0 }} {...baseProps} />);

    expect(screen.getByText('new')).toBeInTheDocument();
    expect(screen.getByTestId('event-cart-item')).toHaveClass('border-success');
  });

  it('marks an item removed from the cart but still in the active order with the destructive style and a Deleted badge, and hides the delete icon', () => {
    render(<EventCartItem item={{ ...baseItem, quantity: 0, actualQuantity: 1 }} {...baseProps} />);

    expect(screen.getByText('deleted')).toBeInTheDocument();
    expect(screen.getByText('Active order: 1 unit(s)')).toBeInTheDocument();
    expect(screen.getByTestId('event-cart-item')).toHaveClass('border-destructive');
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
  });

  it('applies no special style/badge when quantity and actualQuantity are both positive and equal', () => {
    render(<EventCartItem item={{ ...baseItem, quantity: 2, actualQuantity: 2 }} {...baseProps} />);

    expect(screen.queryByText('new')).not.toBeInTheDocument();
    expect(screen.queryByText('deleted')).not.toBeInTheDocument();
    expect(screen.queryByText('changed')).not.toBeInTheDocument();
    expect(screen.getByTestId('event-cart-item')).not.toHaveClass('border-success');
    expect(screen.getByTestId('event-cart-item')).not.toHaveClass('border-destructive');
  });

  it('shows a Changed badge (no special border) when quantity and actualQuantity are both positive but differ', () => {
    render(<EventCartItem item={{ ...baseItem, quantity: 3, actualQuantity: 2 }} {...baseProps} />);

    expect(screen.getByText('changed')).toBeInTheDocument();
    expect(screen.getByText('Active order: 2 unit(s)')).toBeInTheDocument();
    expect(screen.queryByText('new')).not.toBeInTheDocument();
    expect(screen.queryByText('deleted')).not.toBeInTheDocument();
    expect(screen.getByTestId('event-cart-item')).not.toHaveClass('border-success');
    expect(screen.getByTestId('event-cart-item')).not.toHaveClass('border-destructive');
    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument();
  });

  it('shows no badge and no Active order text once the previous order was cancelled (order-choice "Yes" path) — new items add without any order-state indicator', () => {
    activeOrderCountState.data = { total: 0, haveActive: false };
    render(<EventCartItem item={{ ...baseItem, quantity: 2, actualQuantity: 0 }} {...baseProps} />);

    expect(screen.queryByText('new')).not.toBeInTheDocument();
    expect(screen.queryByText('deleted')).not.toBeInTheDocument();
    expect(screen.queryByText('changed')).not.toBeInTheDocument();
    expect(screen.queryByText(/Active order:/)).not.toBeInTheDocument();
    expect(screen.getByTestId('event-cart-item')).not.toHaveClass('border-success');
    expect(screen.getByTestId('event-cart-item')).not.toHaveClass('border-destructive');
  });

  it('shows no badge, no border, and no Active order text on a DRAFT event, even when the item would otherwise be new/deleted/changed', () => {
    eventDetailState.status = 'DRAFT';
    render(<EventCartItem item={{ ...baseItem, quantity: 0, actualQuantity: 1 }} {...baseProps} />);

    expect(screen.queryByText('new')).not.toBeInTheDocument();
    expect(screen.queryByText('deleted')).not.toBeInTheDocument();
    expect(screen.queryByText('changed')).not.toBeInTheDocument();
    expect(screen.queryByText(/Active order:/)).not.toBeInTheDocument();
    expect(screen.getByTestId('event-cart-item')).not.toHaveClass('border-success');
    expect(screen.getByTestId('event-cart-item')).not.toHaveClass('border-destructive');
    // Quantity is 0 in the cart but the event isn't ACTIVE, so this isn't a
    // "pending removal from an order" state — the delete icon still applies.
    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument();
  });
});

describe('EventCartItem — manual quantity editing', () => {
  it('allows replacing the current number and commits the new quantity on Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EditableQuantityHarness onSubmit={onSubmit} />);

    const input = screen.getByRole('spinbutton', { name: 'quantity' });
    await user.clear(input);
    await user.type(input, '4');

    expect(input).toHaveValue(4);
    expect(screen.getByRole('status', { name: 'Committed quantity' })).toHaveTextContent('2');

    await user.keyboard('{Enter}');

    expect(screen.getByRole('status', { name: 'Committed quantity' })).toHaveTextContent('4');
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it.each(['', '0'])('restores the previous quantity when Enter is pressed with %j', async (draft) => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EditableQuantityHarness onSubmit={onSubmit} />);

    const input = screen.getByRole('spinbutton', { name: 'quantity' });
    await user.clear(input);
    if (draft) await user.type(input, draft);
    await user.keyboard('{Enter}');

    expect(input).toHaveValue(2);
    expect(screen.getByRole('status', { name: 'Committed quantity' })).toHaveTextContent('2');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
