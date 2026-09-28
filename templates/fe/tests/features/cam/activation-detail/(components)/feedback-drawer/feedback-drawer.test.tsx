import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import FeedbackDrawer from '@/features/cam/activation-detail/(components)/feedback-drawer/feedback-drawer';
import messages from '@/messages/en.json';

vi.mock('@/features/cam/activation-detail/(hooks)/use-feedback-drawer-url', () => ({
  useFeedbackDrawerUrl: () => ({ open: true, closeDrawer: vi.fn() }),
}));

vi.mock('@/features/cam/activation-detail/(hooks)/use-feedback-drawer-actions', () => ({
  useFeedbackDrawerActions: () => ({
    reasons: [],
    comments: [],
    isAdmin: true,
    isClarification: false,
    addReason: vi.fn(),
    toggleReason: vi.fn(),
    deleteReason: vi.fn(),
    submit: vi.fn(),
    isAdding: false,
    isDeleting: false,
    togglingIds: new Set<string>(),
    isSubmitting: false,
  }),
}));

vi.mock('@/features/cam/activation-detail/(components)/feedback-drawer/feedback-reasons-section', () => ({
  default: () => <div>Reasons</div>,
}));

vi.mock('@/features/cam/activation-detail/(components)/feedback-drawer/feedback-comment-list', () => ({
  default: () => null,
}));

vi.mock('@/shared/components/ui/editor', () => ({
  Editor: ({ focusOnMount }: { focusOnMount?: boolean }) => (
    <div data-testid="comment-editor" data-focus-on-mount={focusOnMount} />
  ),
}));

vi.mock('@/shared/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

describe('FeedbackDrawer', () => {
  it('expands the comment editor only after the additional comment input is focused', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <FeedbackDrawer activationId="activation-1" status="REVIEW" />
      </NextIntlClientProvider>,
    );

    const commentInput = screen.getByRole('textbox', { name: 'Addition comment' });

    expect(commentInput).toHaveAttribute('placeholder', 'Additional comment ...');
    expect(screen.queryByTestId('comment-editor')).not.toBeInTheDocument();

    await userEvent.setup().click(commentInput);

    expect(screen.queryByRole('textbox', { name: 'Addition comment' })).not.toBeInTheDocument();
    expect(screen.getByTestId('comment-editor')).toHaveAttribute('data-focus-on-mount', 'true');
  });
});
