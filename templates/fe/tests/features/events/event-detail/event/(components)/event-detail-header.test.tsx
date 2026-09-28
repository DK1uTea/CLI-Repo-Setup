import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EventDetailHeader } from '@/features/events/event-detail/event/(components)/event-detail-header';
import messages from '@/messages/en.json';
import { PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions';
import { useUserStore } from '@/shared/stores/use-user-store';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/features/events/event-form/(hooks)/use-duplicate-event', () => ({
  useDuplicateEvent: () => ({ duplicate: vi.fn(), isPending: false }),
}));

vi.mock('@/features/events/event-detail/event/(components)/event-detail-download-pdf', () => ({
  EventDetailDownloadPdf: () => null,
}));

afterEach(() => {
  useUserStore.setState({ permissions: null });
});

describe('EventDetailHeader', () => {
  it('shows transfer action to a wildcard admin who is not the event owner', () => {
    useUserStore.setState({ permissions: [PERMISSION_ALL_WILDCARD] });

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <EventDetailHeader
          event={{
            id: 'event-1',
            name: 'Launch',
            createdAt: '2026-08-01T08:00:00Z',
            startTime: '2026-08-02T10:00:00Z',
            endTime: '2026-08-02T18:00:00Z',
            isOwner: false,
          }}
          onTransfer={vi.fn()}
        />
      </NextIntlClientProvider>,
    );

    const transferButton = screen.getByRole('button', { name: 'Transfer event' });
    expect(transferButton).toBeInTheDocument();
    expect(transferButton.closest('[data-slot="card"]')).toBeInTheDocument();
  });
});
