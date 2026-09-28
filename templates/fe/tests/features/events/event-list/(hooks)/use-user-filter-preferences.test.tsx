import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { userFilterPreferenceKeys } from '@/features/events/event-list/(helpers)/user-filter-preferences';
import { useSaveUserFilterPreferences } from '@/features/events/event-list/(hooks)/use-user-filter-preferences';

vi.mock('@/lib/api', () => ({
  apiProxy: { get: vi.fn(), put: vi.fn() },
}));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe('useUserFilterPreferences', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stores the submitted filters as the saved snapshot after a successful save', async () => {
    vi.mocked(apiProxy.put).mockResolvedValue({});
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(userFilterPreferenceKeys.screen('EVENT_NAVIGATOR_LIST'), { timeFrame: 'PAST' });
    const { result } = renderHook(() => useSaveUserFilterPreferences('EVENT_NAVIGATOR_LIST'), { wrapper });

    await act(() => result.current.mutateAsync({ timeFrame: 'NEXT_3_MONTHS', onlyMine: false }));

    expect(apiProxy.put).toHaveBeenCalledWith('etr/user-filter-preferences/EVENT_NAVIGATOR_LIST', {
      filters: { timeFrame: 'NEXT_3_MONTHS', onlyMine: false },
    });
    expect(queryClient.getQueryData(userFilterPreferenceKeys.screen('EVENT_NAVIGATOR_LIST'))).toEqual({
      timeFrame: 'NEXT_3_MONTHS',
      onlyMine: false,
    });
  });
});
