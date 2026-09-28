import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EventFormOrderChoiceDialog } from '@/features/events/event-form/(components)/event-form-order-choice-dialog';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

describe('EventFormOrderChoiceDialog', () => {
  it('renders the title, description, and all actions when open', () => {
    render(
      <EventFormOrderChoiceDialog
        open
        onStay={vi.fn()}
        onReactivate={vi.fn()}
        onCreateOrder={vi.fn()}
        isPending={false}
        isCreatingOrder={false}
      />,
    );

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'stayOnPage' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'reactivateOrder' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'createOrder' })).toBeInTheDocument();
  });

  it('calls onStay when Stay on page is clicked', async () => {
    const onStay = vi.fn();
    const user = userEvent.setup();
    render(
      <EventFormOrderChoiceDialog
        open
        onStay={onStay}
        onReactivate={vi.fn()}
        onCreateOrder={vi.fn()}
        isPending={false}
        isCreatingOrder={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'stayOnPage' }));

    expect(onStay).toHaveBeenCalledTimes(1);
  });

  it('calls onReactivate when Reactivate order is clicked', async () => {
    const onReactivate = vi.fn();
    const user = userEvent.setup();
    render(
      <EventFormOrderChoiceDialog
        open
        onStay={vi.fn()}
        onReactivate={onReactivate}
        onCreateOrder={vi.fn()}
        isPending={false}
        isCreatingOrder={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'reactivateOrder' }));

    expect(onReactivate).toHaveBeenCalledTimes(1);
  });

  it('calls onCreateOrder when Create new order is clicked', async () => {
    const onCreateOrder = vi.fn();
    const user = userEvent.setup();
    render(
      <EventFormOrderChoiceDialog
        open
        onStay={vi.fn()}
        onReactivate={vi.fn()}
        onCreateOrder={onCreateOrder}
        isPending={false}
        isCreatingOrder={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'createOrder' }));

    expect(onCreateOrder).toHaveBeenCalledTimes(1);
  });

  it('disables all actions while reactivating', () => {
    render(
      <EventFormOrderChoiceDialog
        open
        onStay={vi.fn()}
        onReactivate={vi.fn()}
        onCreateOrder={vi.fn()}
        isPending
        isCreatingOrder={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'stayOnPage' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'reactivating' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'createOrder' })).toBeDisabled();
  });

  it('disables all actions while creating a new order', () => {
    render(
      <EventFormOrderChoiceDialog
        open
        onStay={vi.fn()}
        onReactivate={vi.fn()}
        onCreateOrder={vi.fn()}
        isPending={false}
        isCreatingOrder
      />,
    );

    expect(screen.getByRole('button', { name: 'stayOnPage' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'reactivateOrder' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'creatingOrder' })).toBeDisabled();
  });
});
