import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { InviteLink } from '@/features/reporting-tool/(helpers)/trade-fair-event-type';
import { useCreateInviteLink } from '@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-create-invite-link';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiProxy: { post } }));

const link: InviteLink = {
  id: 'link-1', token: 'token-1', role: 'PROMOTER', eventSurveyId: 'event-survey-1',
  usedCount: 0, maxUses: 100, status: 'ACTIVE', createdAt: '2026-07-31T00:00:00.000Z',
};

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, invalidate, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  post.mockResolvedValue({ data: { data: link } });
});

describe('useCreateInviteLink', () => {
  it('creates an event-survey invite with the selected role and maxUses 100', async () => {
    const view = setup();
    const { result } = renderHook(() => useCreateInviteLink('event-survey-1'), { wrapper: view.wrapper });
    await act(async () => { await expect(result.current.createInviteLink('PROMOTER')).resolves.toEqual(link); });
    expect(post).toHaveBeenCalledWith('tf/invite-link/event-survey/event-survey-1', {
      role: 'PROMOTER', maxUses: 100,
    });
  });

  it('adds a newly created invite to cache and invalidates the invite query', async () => {
    const view = setup();
    const { result } = renderHook(() => useCreateInviteLink('event-survey-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.createInviteLink('PROMOTER'); });
    expect(view.queryClient.getQueryData(['trade-fair-invite-link-list', 'event-survey-1']))
      .toEqual([link]);
    await waitFor(() => expect(view.invalidate).toHaveBeenCalledWith({
      queryKey: ['trade-fair-invite-link-list', 'event-survey-1'],
    }));
  });

  it('does not duplicate an invite already present in cache', async () => {
    const view = setup();
    view.queryClient.setQueryData(['trade-fair-invite-link-list', 'event-survey-1'], [link]);
    const { result } = renderHook(() => useCreateInviteLink('event-survey-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.createInviteLink('PROMOTER'); });
    expect(view.queryClient.getQueryData(['trade-fair-invite-link-list', 'event-survey-1']))
      .toEqual([link]);
  });
});
