import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EventFormDraftDialog } from '@/features/events/event-form/(components)/event-form-draft-dialog';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

describe('EventFormDraftDialog', () => {
  it('renders the title, description, and both actions when open', () => {
    render(<EventFormDraftDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} isPending={false} />);

    expect(screen.getAllByText('actions.saveAsDraft').length).toBeGreaterThan(0);
    expect(screen.getByText(/Are you sure you want to save this event as a draft/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'actions.cancel' })).toBeInTheDocument();
  });

  it('calls onConfirm when Confirm is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<EventFormDraftDialog open onOpenChange={vi.fn()} onConfirm={onConfirm} isPending={false} />);

    await user.click(screen.getByRole('button', { name: 'actions.saveAsDraft' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not close on Confirm by itself — the caller controls onOpenChange after the mutation resolves', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<EventFormDraftDialog open onOpenChange={onOpenChange} onConfirm={vi.fn()} isPending={false} />);

    await user.click(screen.getByRole('button', { name: 'actions.saveAsDraft' }));

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('disables both actions while pending and shows the saving label', () => {
    render(<EventFormDraftDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} isPending />);

    expect(screen.getByRole('button', { name: 'actions.cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });

  it('renders nothing interactive when closed', () => {
    render(<EventFormDraftDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'actions.saveAsDraft' })).not.toBeInTheDocument();
  });
});
