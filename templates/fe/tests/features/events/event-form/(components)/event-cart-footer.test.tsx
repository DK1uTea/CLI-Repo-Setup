import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EventCartFooter } from '@/features/events/event-form/(components)/event-cart-footer';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

const baseProps = {
  rentalTotal: 114,
  purchaseTotal: 0,
  currencySymbol: '€',
  isPending: false,
  disabled: false,
  onNext: vi.fn(),
};

describe('EventCartFooter', () => {
  it('renders only Save & Continue when the cart has no order changes', () => {
    render(<EventCartFooter {...baseProps} hasCartChanges={false} onFinalizeEvent={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'actions.next' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'actions.submit' })).not.toBeInTheDocument();
  });

  it('renders Finalize event next to Save & Continue when the cart has order changes', () => {
    render(<EventCartFooter {...baseProps} hasCartChanges onFinalizeEvent={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'actions.next' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'actions.submit' })).toBeInTheDocument();
  });

  it('calls onFinalizeEvent when Finalize event is clicked', async () => {
    const onFinalizeEvent = vi.fn();
    const user = userEvent.setup();
    render(<EventCartFooter {...baseProps} hasCartChanges onFinalizeEvent={onFinalizeEvent} />);

    await user.click(screen.getByRole('button', { name: 'actions.submit' }));

    expect(onFinalizeEvent).toHaveBeenCalledTimes(1);
  });

  it('disables Finalize event the same way as Save & Continue', () => {
    render(<EventCartFooter {...baseProps} disabled hasCartChanges onFinalizeEvent={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'actions.next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'actions.submit' })).toBeDisabled();
  });
});
