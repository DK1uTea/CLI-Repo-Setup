import { describe, expect, it } from 'vitest';

import type { TradeFairEvent } from '@/features/reporting-tool/(helpers)/trade-fair-event-type';
import {
  mapTradeFairEventFormToPayload,
  mapTradeFairEventToFormValues,
} from '@/features/reporting-tool/trade-fair-event-form/(helpers)/trade-fair-event-form-mapper';
import type { TradeFairEventFormDto } from '@/features/reporting-tool/trade-fair-event-form/(helpers)/trade-fair-event-form-schema';

const event: TradeFairEvent = {
  id: 'event-1', name: 'Berlin Fair', description: 'Description', type: 'FAIR', leadTarget: 25,
  startDate: '2026-08-01T07:30:00.000Z', endDate: '2026-08-02T16:45:00.000Z',
  status: 'DRAFT', mode: 'FACE_TO_FACE', eventCode: 'EVENT-1001',
  targetAudience: 'Retail', participation: 'Exhibitor', locationId: 'location-1',
  location: {
    id: 'location-1', locationName: 'Messe Berlin', street: 'Messedamm 22', city: 'Berlin',
    postcode: '14055', state: 'Berlin', countryCode: 'DE', latitude: 52.5,
    longitude: 13.3, status: 'ACTIVE', userId: 'user-1', country: 'Germany',
  },
  attachments: [{
    id: 'attachment-1', url: 'https://cdn.example/fair.png', filename: 'fair.png',
    mimeType: 'image/png', size: 1234,
  }],
  surveys: [{
    id: 'survey-1', eventSurveyId: 'event-survey-1', name: 'Visitor survey', description: '',
    assignmentCount: 0, assignments: [], requiredLogin: false, canEdit: true,
  }],
};

const form: TradeFairEventFormDto = {
  eventId: 'EVENT-1001', title: 'Berlin Fair', eventMode: 'FACE_TO_FACE',
  targetAudience: ['Retail'], eventType: 'FAIR', description: 'Description',
  participation: 'Exhibitor', images: [{
    name: 'fair.png', size: 1234, preview: 'blob:preview', url: 'https://cdn.example/fair.png',
    file: new File(['image'], 'fair.png', { type: 'image/png' }),
  }],
  startDate: '2026-08-01', startTime: '07:30', endDate: '2026-08-02', endTime: '16:45',
  eventLocation: 'location-1', locationId: 'location-1', address: 'Messe Berlin',
  street: 'Messedamm 22', zipCode: '14055', city: 'Berlin', isSaveLocation: false,
  surveys: [{ surveyId: 'survey-1', requiredLogin: false }],
};

describe('mapTradeFairEventToFormValues', () => {
  it('maps event, UTC dates, attachment, location, and survey values', () => {
    expect(mapTradeFairEventToFormValues(event)).toMatchObject({
      title: 'Berlin Fair', eventId: 'EVENT-1001', startDate: '2026-08-01', startTime: '07:30',
      endDate: '2026-08-02', endTime: '16:45', targetAudience: ['Retail'],
      eventLocation: 'location-1', address: 'Messe Berlin',
      images: [{ name: 'fair.png', size: 1234, preview: 'https://cdn.example/fair.png' }],
      surveys: [{ surveyId: 'survey-1', requiredLogin: false }],
    });
  });

  it('normalises a non-array attachments response to an empty image list', () => {
    expect(mapTradeFairEventToFormValues({ ...event, attachments: {} as never }).images).toEqual([]);
  });

  it('leaves address fields empty when the location relation is null', () => {
    const result = mapTradeFairEventToFormValues({ ...event, location: null as never });
    expect(result).toMatchObject({ eventLocation: '', locationId: undefined, address: undefined, city: undefined });
  });

  it('defaults absent participation and surveys without throwing', () => {
    const result = mapTradeFairEventToFormValues({ ...event, participation: undefined, surveys: undefined });
    expect(result.participation).toBe('');
    expect(result.surveys).toEqual([]);
  });

  it('defaults a nullable requiredLogin response to true', () => {
    const surveys = [{ ...event.surveys![0], requiredLogin: null as never }];
    expect(mapTradeFairEventToFormValues({ ...event, surveys }).surveys)
      .toEqual([{ surveyId: 'survey-1', requiredLogin: true }]);
  });
});

describe('mapTradeFairEventFormToPayload', () => {
  it('maps UTC date-times, location, audience, and attachment transport fields', () => {
    expect(mapTradeFairEventFormToPayload(form)).toMatchObject({
      name: 'Berlin Fair', eventCode: 'EVENT-1001', targetAudience: 'Retail',
      startDate: '2026-08-01T07:30:00.000Z', endDate: '2026-08-02T16:45:00.000Z',
      locationId: 'location-1',
      location: { locationName: 'Messe Berlin', postcode: '14055', city: 'Berlin' },
      attachments: [{
        url: 'https://cdn.example/fair.png', filename: 'fair.png', mimeType: 'image/png', size: 1234,
      }],
    });
  });

  it('uses preview URL and omits blank location id when no uploaded URL exists', () => {
    const payload = mapTradeFairEventFormToPayload({
      ...form, locationId: '', targetAudience: [],
      images: [{ name: 'fair.png', size: 10, preview: 'blob:preview' }],
    });
    expect(payload.locationId).toBeUndefined();
    expect(payload.targetAudience).toBe('');
    expect(payload.attachments[0]).toMatchObject({ url: 'blob:preview', mimeType: '' });
  });
});
