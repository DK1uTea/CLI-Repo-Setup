import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventListSaveFilter } from '@/features/events/event-list/(components)/event-list-save-filter';
import {
  DEFAULT_SAVED_FILTERS,
  userFilterPreferenceKeys,
  type FilterPreferenceScreen,
  type SavedUserFilters,
} from '@/features/events/event-list/(helpers)/user-filter-preferences';
import { apiProxy } from '@/lib/api';
import messages from '@/messages/en.json';

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn(), put: vi.fn() } }));

const CHANGED_FILTERS: SavedUserFilters = {
  ...DEFAULT_SAVED_FILTERS,
  status: 'ACTIVE',
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale="en" messages={messages}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </NextIntlClientProvider>
    );
  };
}

function renderFilter(
  payload: SavedUserFilters,
  screen: FilterPreferenceScreen = 'EVENT_NAVIGATOR_CALENDAR',
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <EventListSaveFilter screen={screen} payload={payload} onReset={vi.fn()} />,
    { wrapper: createWrapper(queryClient) },
  );
  return queryClient;
}

async function openActions() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Save Filter' }));
  return {
    user,
    save: await screen.findByRole('button', { name: 'Save' }),
    reset: screen.getByRole('button', { name: 'Reset' }),
  };
}

describe('EventListSaveFilter calendar state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiProxy.get).mockResolvedValue({
      data: { data: { filters: DEFAULT_SAVED_FILTERS } },
    });
    vi.mocked(apiProxy.put).mockResolvedValue({});
  });

  it('disables Save but keeps Reset enabled when filters match the saved snapshot', async () => {
    renderFilter(DEFAULT_SAVED_FILTERS);

    const { save, reset } = await openActions();

    await waitFor(() => {
      expect(save).toBeDisabled();
      expect(reset).toBeEnabled();
    });
  });

  it('enables both actions after a change and disables them after Save', async () => {
    const queryClient = renderFilter(CHANGED_FILTERS);
    const { user, save, reset } = await openActions();

    await waitFor(() => {
      expect(save).toBeEnabled();
      expect(reset).toBeEnabled();
    });
    await user.click(save);
    await waitFor(() => expect(apiProxy.put).toHaveBeenCalled());

    queryClient.setQueryData(
      userFilterPreferenceKeys.screen('EVENT_NAVIGATOR_CALENDAR'),
      DEFAULT_SAVED_FILTERS,
    );

    await user.click(screen.getByRole('button', { name: 'Save Filter' }));
    expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled();
  });

  it('disables both actions after Reset applies the default snapshot', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    function ResetHarness() {
      const [payload, setPayload] = useState(CHANGED_FILTERS);
      return (
        <EventListSaveFilter
          screen="EVENT_NAVIGATOR_CALENDAR"
          payload={payload}
          onReset={() => setPayload(DEFAULT_SAVED_FILTERS)}
        />
      );
    }
    render(<ResetHarness />, { wrapper: createWrapper(queryClient) });

    const { user, reset } = await openActions();
    await waitFor(() => expect(reset).toBeEnabled());
    await user.click(reset);
    await waitFor(() => expect(apiProxy.put).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'Save Filter' }));
    expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled();
  });

  it('disables only EVENT_NAVIGATOR_LIST Save when its payload is unchanged', async () => {
    renderFilter(DEFAULT_SAVED_FILTERS, 'EVENT_NAVIGATOR_LIST');

    const { save, reset } = await openActions();

    await waitFor(() => {
      expect(save).toBeDisabled();
      expect(reset).toBeEnabled();
    });
  });
});
