import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mapFormToLogisticsPayload,
  submitLogisticsStep,
} from '@/features/events/event-form/(hooks)/use-submit-step-logistics';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

const { patch, post } = vi.hoisted(() => ({
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ apiProxy: { patch, post } }));

const BASE_FORM_DATA = {
  accessPermit: [],
  certifications: [],
  eventDocuments: [],
  venueLayouts: [],
  logisticsContactName: 'Contact',
  logisticsContactEmail: 'contact@example.com',
  logisticsContactPhone: '+491701234567',
  wareHouseCode: 'WH1',
  logisticComment: '',
  isDifferentDeliveryAddress: false,
  deliveryLocations: [],
  setupStartDate: '2026-08-12',
  setupStartTime: '00:00',
  setupEndDate: '2026-08-13',
  setupEndTime: '00:00',
  teardownStartDate: '2026-08-14',
  teardownStartTime: '00:00',
  teardownEndDate: '2026-08-15',
  teardownEndTime: '00:00',
} as unknown as EventFormDto;

describe('mapFormToLogisticsPayload', () => {
  it('does not include a status field by default', () => {
    const payload = mapFormToLogisticsPayload(BASE_FORM_DATA);

    expect(payload).not.toHaveProperty('status');
  });

  it('includes status: "DRAFT" when asDraft is true', () => {
    const payload = mapFormToLogisticsPayload(BASE_FORM_DATA, { asDraft: true });

    expect(payload.status).toBe('DRAFT');
  });
});

describe('submitLogisticsStep', () => {
  beforeEach(() => vi.clearAllMocks());

  it('PATCHes Logistics in the create flow after Overview has created the Event', async () => {
    const payload = mapFormToLogisticsPayload(BASE_FORM_DATA);

    await submitLogisticsStep('event-1', payload);

    expect(patch).toHaveBeenCalledWith('/etr/events/event-1/logistics', payload);
    expect(post).not.toHaveBeenCalled();
  });
});
