import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EventFormDeleteDialog } from '@/features/events/event-form/(components)/event-form-delete-dialog';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

describe('EventFormDeleteDialog', () => {
  it('renders the "move to trash" title, description, and both actions when open', () => {
    render(<EventFormDeleteDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} isPending={false} />);

    expect(screen.getByText('actions.deleteEventTitle')).toBeInTheDocument();
    expect(screen.getByText('actions.deleteEventDescription')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'actions.cancel' })).toBeInTheDocument();
  });

  it('exposes the confirm action via the fixed data-testid used by e2e', () => {
    render(<EventFormDeleteDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} isPending={false} />);

    expect(screen.getByTestId('event-form-confirm-delete-button')).toBeInTheDocument();
  });

  it('calls onConfirm when Confirm is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<EventFormDeleteDialog open onOpenChange={vi.fn()} onConfirm={onConfirm} isPending={false} />);

    await user.click(screen.getByTestId('event-form-confirm-delete-button'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables both actions while pending and shows the deleting label', () => {
    render(<EventFormDeleteDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} isPending />);

    expect(screen.getByRole('button', { name: 'actions.cancel' })).toBeDisabled();
    expect(screen.getByTestId('event-form-confirm-delete-button')).toBeDisabled();
    expect(screen.getByText('actions.deletingEvent')).toBeInTheDocument();
  });

  it('renders nothing interactive when closed', () => {
    render(<EventFormDeleteDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.queryByTestId('event-form-confirm-delete-button')).not.toBeInTheDocument();
  });
});
