import { beforeEach, describe, expect, it, vi } from 'vitest';

import { submitEventSummary } from '@/features/events/event-form/(hooks)/use-submit-event';

const { patch, post } = vi.hoisted(() => ({
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ apiProxy: { patch, post } }));

describe('submitEventSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    post.mockResolvedValue({ data: { data: { id: 'event-1' } } });
  });

  it('POSTs Summary as the final step of the event creation/edit flow', async () => {
    await submitEventSummary('event-1');

    expect(post).toHaveBeenCalledWith('/etr/events/event-1/summary');
    expect(patch).not.toHaveBeenCalled();
  });
});
