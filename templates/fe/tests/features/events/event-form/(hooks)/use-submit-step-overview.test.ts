import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mapFormToOverviewPayload,
  submitOverviewStep,
} from '@/features/events/event-form/(hooks)/use-submit-step-overview';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

const { patch, post } = vi.hoisted(() => ({
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ apiProxy: { patch, post } }));

const BASE_FORM_DATA = {
  title: 'Test Event',
  mode: 'FACE_TO_FACE',
  targetAudience: ['CONSUMER'],
  customEventId: 'EVENT-100001',
  eventTypeId: 'type-1',
  shortDescription: 'desc',
  participation: 'NOT_POSSIBLE',
  link: '',
  images: [],
  startDate: '2026-08-12',
  startTime: '00:00',
  endDate: '2026-08-13',
  endTime: '00:00',
  locationId: '',
  address: 'Venue',
  street: 'Street 1',
  zipCode: '80331',
  city: 'Munich',
  isSaveAddress: false,
  contactFirstName: 'Max',
  contactLastName: 'Mustermann',
  contactEmail: 'max@example.com',
  contactPhone: '+49',
  contacts: [],
  partnershipTypes: ['EXHIBITION'],
  productPartnerCategories: [],
} as unknown as EventFormDto;

describe('mapFormToOverviewPayload', () => {
  it('does not include a status field by default', () => {
    const payload = mapFormToOverviewPayload(BASE_FORM_DATA, 'event-1', false);

    expect(payload).not.toHaveProperty('status');
  });

  it('includes status: "DRAFT" when asDraft is true', () => {
    const payload = mapFormToOverviewPayload(BASE_FORM_DATA, 'event-1', false, { asDraft: true });

    expect(payload.status).toBe('DRAFT');
  });
});

describe('submitOverviewStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patch.mockResolvedValue({ data: { data: { id: 'event-1' } } });
    post.mockResolvedValue({ data: { data: { id: 'event-1' } } });
  });

  it('PATCHes Overview after the create flow already has an Event ID', async () => {
    const payload = mapFormToOverviewPayload(BASE_FORM_DATA, 'event-1', false);

    await submitOverviewStep(payload, 'event-1');

    expect(patch).toHaveBeenCalledWith('/etr/events/event-1/overview', payload);
    expect(post).not.toHaveBeenCalled();
  });

  it('POSTs Overview only before an Event ID exists', async () => {
    const payload = mapFormToOverviewPayload(BASE_FORM_DATA, undefined, false);

    await submitOverviewStep(payload);

    expect(post).toHaveBeenCalledWith('/etr/events/overview', payload);
    expect(patch).not.toHaveBeenCalled();
  });
});
