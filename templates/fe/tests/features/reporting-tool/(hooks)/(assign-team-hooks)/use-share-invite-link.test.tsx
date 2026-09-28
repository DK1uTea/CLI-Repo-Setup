import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { InviteLink } from '@/features/reporting-tool/(helpers)/trade-fair-event-type';
import { useShareInviteLink } from '@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-share-invite-link';

const { createInviteLink, error, reset, success, writeText } = vi.hoisted(() => ({
  createInviteLink: vi.fn(), error: vi.fn(), reset: vi.fn(), success: vi.fn(), writeText: vi.fn(),
}));
let inviteLinks: InviteLink[] = [];

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('sonner', () => ({ toast: { error, success } }));
vi.mock('@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-get-invite-link', () => ({
  useGetInviteLink: () => ({ inviteLinks, isLoading: false, isFetching: false }),
}));
vi.mock('@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-create-invite-link', () => ({
  useCreateInviteLink: () => ({ createInviteLink, isCreating: false, isError: false, reset }),
}));

const link = (role: InviteLink['role'], token = 'token value'): InviteLink => ({
  id: `link-${role}`, token, role, eventSurveyId: 'event-survey-1', usedCount: 0,
  maxUses: 100, status: 'ACTIVE', createdAt: '2026-07-31T00:00:00.000Z',
});

beforeEach(() => {
  vi.clearAllMocks();
  inviteLinks = [];
  createInviteLink.mockResolvedValue(undefined);
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  process.env.NEXT_PUBLIC_EXTERNAL_TRADE_FAIR_INVITE_URL = 'https://invite.example/join';
});

afterEach(() => delete process.env.NEXT_PUBLIC_EXTERNAL_TRADE_FAIR_INVITE_URL);

describe('useShareInviteLink', () => {
  it('forces PROMOTER when the survey does not require login', async () => {
    renderHook(() => useShareInviteLink({ eventSurveyId: 'event-survey-1', requiredLogin: false }));
    await waitFor(() => expect(createInviteLink).toHaveBeenCalledWith('PROMOTER'));
  });

  it('uses PROMOTER by default when login is required', async () => {
    renderHook(() => useShareInviteLink({ eventSurveyId: 'event-survey-1' }));
    await waitFor(() => expect(createInviteLink).toHaveBeenCalledWith('PROMOTER'));
  });

  it('does not create a link when a matching role link already exists', () => {
    inviteLinks = [link('PROMOTER')];
    const { result } = renderHook(() => useShareInviteLink({
      eventSurveyId: 'event-survey-1', requiredLogin: false,
    }));
    expect(createInviteLink).not.toHaveBeenCalled();
    expect(result.current.inviteLink).toBe('https://invite.example/join?token=token%20value');
  });

  it('switches the active required-login role and resets mutation state', async () => {
    const { result } = renderHook(() => useShareInviteLink({ eventSurveyId: 'event-survey-1' }));
    await act(async () => { result.current.setRole('ADMIN'); });
    await waitFor(() => expect(createInviteLink).toHaveBeenCalledWith('ADMIN'));
    expect(reset).toHaveBeenCalled();
  });

  it('copies the generated invite link and shows success feedback', async () => {
    inviteLinks = [link('PROMOTER')];
    const { result } = renderHook(() => useShareInviteLink({
      eventSurveyId: 'event-survey-1', requiredLogin: false,
    }));
    await act(async () => { await result.current.copyInviteLink(); });
    expect(writeText).toHaveBeenCalledWith('https://invite.example/join?token=token%20value');
    expect(success).toHaveBeenCalledWith('copySuccess');
  });

  it('shows error feedback when clipboard writing fails', async () => {
    inviteLinks = [link('PROMOTER')];
    writeText.mockRejectedValue(new Error('clipboard denied'));
    const { result } = renderHook(() => useShareInviteLink({
      eventSurveyId: 'event-survey-1', requiredLogin: false,
    }));
    await act(async () => { await result.current.copyInviteLink(); });
    expect(error).toHaveBeenCalledWith('copyError');
  });
});
