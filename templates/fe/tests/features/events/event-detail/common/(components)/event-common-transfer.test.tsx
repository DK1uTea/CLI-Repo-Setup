import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import { EventCommonTransfer } from '@/features/events/event-detail/common/(components)/event-common-transfer';
import { apiProxy } from '@/lib/api';
import messages from '@/messages/en.json';

vi.mock('@/lib/api', () => ({
  apiProxy: {
    get: vi.fn(),
  },
}));

describe('EventCommonTransfer', () => {
  it('shows each ownership candidate as name and email', async () => {
    const user = userEvent.setup();
    vi.mocked(apiProxy.get).mockResolvedValue({
      data: {
        data: {
          items: [{ id: 'user-1', name: 'Alex Manager', email: 'alex@example.com' }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false },
        },
      },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="en" messages={messages}>
          <EventCommonTransfer
            open
            onClose={vi.fn()}
            namespace="eventDetail"
            onConfirm={vi.fn()}
          />
        </NextIntlClientProvider>
      </QueryClientProvider>,
    );

    await user.click(screen.getByPlaceholderText(messages.eventDetail.newOwner));

    expect(await screen.findByText('Alex Manager (alex@example.com)')).toBeInTheDocument();
  });

  it('loads ownership candidates only after the dialog opens', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({
      data: { data: { items: [], pagination: null } },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const view = render(
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="en" messages={messages}>
          <EventCommonTransfer
            open={false}
            onClose={vi.fn()}
            namespace="eventDetail"
            onConfirm={vi.fn()}
          />
        </NextIntlClientProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(apiProxy.get).not.toHaveBeenCalled();

    view.rerender(
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="en" messages={messages}>
          <EventCommonTransfer
            open
            onClose={vi.fn()}
            namespace="eventDetail"
            onConfirm={vi.fn()}
          />
        </NextIntlClientProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(apiProxy.get).toHaveBeenCalledTimes(1));
  });
});
