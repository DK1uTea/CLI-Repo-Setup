import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mapFormToHelpingHandsPayload,
  submitHelpingHandsStep,
} from '@/features/events/event-form/(hooks)/use-submit-step-helping-hands';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

const { patch, post } = vi.hoisted(() => ({
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ apiProxy: { patch, post } }));

const BASE_FORM_DATA = {
  helpingHandComment: 'comment',
  assemblyPlanograms: [],
} as unknown as EventFormDto;

describe('mapFormToHelpingHandsPayload', () => {
  it('does not include a status field by default', () => {
    const payload = mapFormToHelpingHandsPayload(BASE_FORM_DATA);

    expect(payload).not.toHaveProperty('status');
  });

  it('includes status: "DRAFT" when asDraft is true', () => {
    const payload = mapFormToHelpingHandsPayload(BASE_FORM_DATA, { asDraft: true });

    expect(payload.status).toBe('DRAFT');
  });
});

describe('submitHelpingHandsStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patch.mockResolvedValue({ data: { data: { id: 'event-1' } } });
  });

  it('PATCHes Helping Hands in the create flow after Overview has created the Event', async () => {
    const payload = mapFormToHelpingHandsPayload(BASE_FORM_DATA);

    await submitHelpingHandsStep('event-1', payload);

    expect(patch).toHaveBeenCalledWith('/etr/events/event-1/helping-hands', payload);
    expect(post).not.toHaveBeenCalled();
  });
});
