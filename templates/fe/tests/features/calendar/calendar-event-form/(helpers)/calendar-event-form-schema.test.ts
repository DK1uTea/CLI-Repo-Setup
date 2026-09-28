import { describe, expect, it } from 'vitest';

import { calendarEventFormSchema } from '@/features/calendar/calendar-event-form/(helpers)/calendar-event-form-schema';

const validCalendarEvent = {
  customEventId: 'calendar-id',
  title: 'Calendar event',
  mode: 'FACE_TO_FACE',
  targetAudience: ['Retail'],
  eventTypeId: 'type-1',
  doNotPublish: false,
  shortDescription: 'Description',
  participation: '',
  link: '',
  images: [{ name: 'cover.jpg', preview: 'blob:cover' }],
  startDate: '2026-09-01',
  startTime: '09:00',
  endDate: '2026-09-01',
  endTime: '10:00',
  locationId: '',
  address: 'Address',
  street: 'Street',
  zipCode: '10115',
  city: 'Berlin',
  isSaveAddress: false,
  contactFirstName: 'Max',
  contactLastName: 'Mustermann',
  contactEmail: 'max@example.com',
  contactPhone: '+49123456789',
  contacts: [],
  partnershipTypes: [],
  productPartnerCategories: [],
};

const fieldErrors = (data: unknown) => {
  const result = calendarEventFormSchema.safeParse(data);
  expect(result.success).toBe(false);
  return result.success ? {} : result.error.flatten().fieldErrors;
};

describe('calendarEventFormSchema', () => {
  it('accepts any non-empty custom Event ID', () => {
    expect(calendarEventFormSchema.safeParse(validCalendarEvent).success).toBe(true);
  });

  it('requires a custom Event ID', () => {
    const result = calendarEventFormSchema.safeParse({ ...validCalendarEvent, customEventId: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('customEventId');
    }
  });

  it('rejects every required Overview field when empty', () => {
    const errors = fieldErrors({
      ...validCalendarEvent,
      title: '',
      mode: '',
      targetAudience: [],
      eventTypeId: '',
      shortDescription: '',
      images: [],
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      address: '',
      street: '',
      zipCode: '',
      city: '',
      contactFirstName: '',
      contactLastName: '',
      contactEmail: '',
    });

    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining([
        'title', 'mode', 'targetAudience', 'eventTypeId', 'shortDescription',
        'images',
        'startDate', 'startTime', 'endDate', 'endTime',
        'address', 'street', 'zipCode', 'city',
        'contactFirstName', 'contactLastName', 'contactEmail',
      ]),
    );
  });

  it('rejects an empty images array', () => {
    expect(fieldErrors({ ...validCalendarEvent, images: [] })).toHaveProperty('images');
  });

  it('does not require the admin contact phone number to be non-empty', () => {
    expect(calendarEventFormSchema.safeParse({ ...validCalendarEvent, contactPhone: '' }).success).toBe(true);
  });

  it('rejects an invalid admin contact email', () => {
    expect(fieldErrors({ ...validCalendarEvent, contactEmail: 'not-an-email' })).toHaveProperty('contactEmail');
  });

  it('rejects an invalid admin contact phone number', () => {
    expect(fieldErrors({ ...validCalendarEvent, contactPhone: 'not-a-phone' })).toHaveProperty('contactPhone');
  });

  it('rejects a description longer than 5,000 characters', () => {
    expect(fieldErrors({ ...validCalendarEvent, shortDescription: 'a'.repeat(5001) }))
      .toHaveProperty('shortDescription');
  });

  it('accepts a description at exactly 5,000 characters', () => {
    expect(
      calendarEventFormSchema.safeParse({ ...validCalendarEvent, shortDescription: 'a'.repeat(5000) }).success,
    ).toBe(true);
  });

  it('rejects an additional contact missing name, role, email, or phone', () => {
    const errors = fieldErrors({
      ...validCalendarEvent,
      contacts: [{ contactName: '', contactEmail: '', contactPhone: '', role: '' }],
    });

    expect(errors).toHaveProperty('contacts');
  });

  it('accepts a complete additional contact', () => {
    expect(
      calendarEventFormSchema.safeParse({
        ...validCalendarEvent,
        contacts: [{ contactName: 'Contact', contactEmail: 'contact@example.com', contactPhone: '+491701234500', role: 'Organizer' }],
      }).success,
    ).toBe(true);
  });

  it('rejects an empty targetAudience array', () => {
    expect(fieldErrors({ ...validCalendarEvent, targetAudience: [] })).toHaveProperty('targetAudience');
  });

  it.each([
    ['2026-09-01', '09:00', '2026-09-01', '09:00'],
    ['2026-09-02', '09:00', '2026-09-01', '17:00'],
  ])('rejects Event end %s %s when not after start %s %s', (startDate, startTime, endDate, endTime) => {
    expect(fieldErrors({ ...validCalendarEvent, startDate, startTime, endDate, endTime }))
      .toHaveProperty('endDate');
  });

  it('accepts Event end exactly one minute after start', () => {
    expect(
      calendarEventFormSchema.safeParse({
        ...validCalendarEvent,
        startDate: '2026-09-01', startTime: '09:00', endDate: '2026-09-01', endTime: '09:01',
      }).success,
    ).toBe(true);
  });

  // testcase/event-calendar/create-event-calendar.md case 78 (corrected 2026-09-08):
  // Partnership is NOT required on its own — only productPartnerCategories becomes
  // required once 'PRODUCT_PARTNER' is ticked. Confirmed with PM: the tester's original
  // expectation ("At least one partnership type is required") does not match the
  // implementation, and the implementation is correct — updated the sheet, not the code.
  it('does not require any Partnership type to be selected (case 78, corrected)', () => {
    expect(calendarEventFormSchema.safeParse({ ...validCalendarEvent, partnershipTypes: [] }).success).toBe(true);
  });

  it('requires Product Partner categories once Product Partner is selected (case 78b)', () => {
    expect(
      fieldErrors({ ...validCalendarEvent, partnershipTypes: ['PRODUCT_PARTNER'], productPartnerCategories: [] }),
    ).toHaveProperty('productPartnerCategories');
  });

  it('accepts Product Partner selected with at least one category', () => {
    expect(
      calendarEventFormSchema.safeParse({
        ...validCalendarEvent,
        partnershipTypes: ['PRODUCT_PARTNER'],
        productPartnerCategories: ['SOFTDRINKS'],
      }).success,
    ).toBe(true);
  });

  it('accepts a non-Product-Partner selection without requiring any category', () => {
    expect(
      calendarEventFormSchema.safeParse({
        ...validCalendarEvent,
        partnershipTypes: ['EXHIBITION'],
        productPartnerCategories: [],
      }).success,
    ).toBe(true);
  });
});
