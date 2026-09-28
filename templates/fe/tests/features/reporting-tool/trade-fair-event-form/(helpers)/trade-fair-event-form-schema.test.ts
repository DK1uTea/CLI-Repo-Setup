import { describe, expect, it } from 'vitest';

import {
  STEP_FIELDS,
  tradeFairEventFormSchema,
} from '@/features/reporting-tool/trade-fair-event-form/(helpers)/trade-fair-event-form-schema';

const validEventForm = {
  eventId: 'EVENT-1001',
  title: 'Berlin Trade Fair',
  eventMode: 'FACE_TO_FACE',
  targetAudience: ['Retail'],
  eventType: 'TRADE_FAIR',
  description: 'Annual trade fair',
  participation: 'Exhibitor',
  images: [{ name: 'stand.png' }],
  startDate: '2026-08-01',
  startTime: '09:00',
  endDate: '2026-08-01',
  endTime: '17:00',
  eventLocation: 'location-1',
  locationId: 'location-1',
  address: 'Messe Berlin',
  street: 'Messedamm 22',
  zipCode: '14055',
  city: 'Berlin',
  isSaveLocation: false,
  surveys: [{ surveyId: 'survey-1', requiredLogin: true }],
};

const fieldErrors = (data: unknown) => {
  const result = tradeFairEventFormSchema.safeParse(data);
  expect(result.success).toBe(false);
  return result.success ? {} : result.error.flatten().fieldErrors;
};

describe('tradeFairEventFormSchema', () => {
  it('accepts complete event and survey data', () => {
    expect(tradeFairEventFormSchema.safeParse(validEventForm).success).toBe(true);
  });

  it.each(['EVENT-', 'event-1001', '1001', 'EVENT-10A'])('accepts non-empty event id %s', (eventId) => {
    expect(tradeFairEventFormSchema.safeParse({ ...validEventForm, eventId }).success).toBe(true);
  });

  it('still requires an event id', () => {
    expect(fieldErrors({ ...validEventForm, eventId: '' })).toHaveProperty('eventId');
  });

  it('rejects every required General Information value when empty', () => {
    const errors = fieldErrors({
      ...validEventForm,
      title: '', eventType: '', images: [], startDate: '', startTime: '', endDate: '',
      endTime: '', address: '', street: '', zipCode: '', city: '',
    });

    expect(Object.keys(errors)).toEqual(expect.arrayContaining([
      'title', 'eventType', 'images', 'startDate', 'startTime', 'endDate',
      'endTime', 'address', 'street', 'zipCode', 'city',
    ]));
  });

  it('accepts empty optional General Information values', () => {
    expect(tradeFairEventFormSchema.safeParse({
      ...validEventForm,
      eventMode: '',
      targetAudience: [],
      description: '',
      participation: '',
    }).success).toBe(true);
  });

  it('rejects a description longer than 5000 characters', () => {
    expect(fieldErrors({ ...validEventForm, description: 'x'.repeat(5001) }))
      .toHaveProperty('description');
  });

  it.each([
    ['2026-08-01', '09:00', '2026-08-01', '09:00'],
    ['2026-08-02', '09:00', '2026-08-01', '17:00'],
  ])('rejects end %s %s when it is not after start %s %s', (startDate, startTime, endDate, endTime) => {
    expect(fieldErrors({ ...validEventForm, startDate, startTime, endDate, endTime }))
      .toHaveProperty('endDate');
  });

  it('rejects the Survey step with no selected survey', () => {
    expect(fieldErrors({ ...validEventForm, surveys: [] })).toHaveProperty('surveys');
  });

  it('assigns validation fields only to the two data-entry steps', () => {
    expect(STEP_FIELDS['general-info']).toContain('eventId');
    expect(STEP_FIELDS.survey).toEqual(['surveys']);
    expect(STEP_FIELDS['assign-team']).toEqual([]);
    expect(STEP_FIELDS['review-launch']).toEqual([]);
  });
});
