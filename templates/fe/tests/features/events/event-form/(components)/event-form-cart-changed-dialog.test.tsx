import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EventFormCartChangedDialog } from '@/features/events/event-form/(components)/event-form-cart-changed-dialog';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

describe('EventFormCartChangedDialog', () => {
  it('renders the title, description, and all actions when open', () => {
    render(
      <EventFormCartChangedDialog
        open
        onLeaveEvent={vi.fn()}
        onStay={vi.fn()}
        onCreateOrder={vi.fn()}
        isPending={false}
      />,
    );

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'leaveEvent' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'stayOnPage' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'createNewOrder' })).toBeInTheDocument();
  });

  it('calls onLeaveEvent when Leave event is clicked', async () => {
    const onLeaveEvent = vi.fn();
    const user = userEvent.setup();
    render(
      <EventFormCartChangedDialog
        open
        onLeaveEvent={onLeaveEvent}
        onStay={vi.fn()}
        onCreateOrder={vi.fn()}
        isPending={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'leaveEvent' }));

    expect(onLeaveEvent).toHaveBeenCalledTimes(1);
  });

  it('calls onStay when Stay on page is clicked', async () => {
    const onStay = vi.fn();
    const user = userEvent.setup();
    render(
      <EventFormCartChangedDialog
        open
        onLeaveEvent={vi.fn()}
        onStay={onStay}
        onCreateOrder={vi.fn()}
        isPending={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'stayOnPage' }));

    expect(onStay).toHaveBeenCalledTimes(1);
  });

  it('calls onCreateOrder when Create new order is clicked', async () => {
    const onCreateOrder = vi.fn();
    const user = userEvent.setup();
    render(
      <EventFormCartChangedDialog
        open
        onLeaveEvent={vi.fn()}
        onStay={vi.fn()}
        onCreateOrder={onCreateOrder}
        isPending={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'createNewOrder' }));

    expect(onCreateOrder).toHaveBeenCalledTimes(1);
  });

  it('disables all actions while pending', () => {
    render(
      <EventFormCartChangedDialog
        open
        onLeaveEvent={vi.fn()}
        onStay={vi.fn()}
        onCreateOrder={vi.fn()}
        isPending
      />,
    );

    expect(screen.getByRole('button', { name: 'leaveEvent' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'stayOnPage' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'creatingOrder' })).toBeDisabled();
  });
});
