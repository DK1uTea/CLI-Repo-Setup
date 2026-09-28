import { describe, expect, it } from 'vitest';

import {
  eventFormSchema,
  STEP_FIELDS,
} from '@/features/events/event-form/(helpers)/event-form-schema';

const validEventForm = {
  // Overview
  customEventId: 'EVENT-1001',
  title: 'Munich Product Launch',
  mode: 'FACE_TO_FACE',
  targetAudience: ['CONSUMER'],
  eventTypeId: 'event-type-1',
  doNotPublish: false,
  shortDescription: 'A short description of the event.',
  participation: 'PERSONAL_INVITATION',
  link: '',
  images: [{ name: 'cover.jpg', preview: 'blob:cover' }],
  startDate: '2026-08-01',
  startTime: '09:00',
  endDate: '2026-08-02',
  endTime: '09:00',
  locationId: '',
  address: 'Test Arena',
  street: 'Teststraße 1',
  zipCode: '80331',
  city: 'München',
  isSaveAddress: false,
  contactFirstName: 'Max',
  contactLastName: 'Mustermann',
  contactEmail: 'max.mustermann@example.com',
  contactPhone: '+491701234567',
  contacts: [],
  partnershipTypes: ['EXHIBITION'],
  productPartnerCategories: [],
  // Logistics
  wareHouseCode: 'WH-1',
  logisticsContactName: 'Logistik Kontakt',
  logisticsContactEmail: 'logistik@example.com',
  logisticsContactPhone: '+491701234599',
  isDifferentDeliveryAddress: false,
  deliveryLocations: [],
  setupStartDate: '2026-07-30',
  setupStartTime: '00:00',
  setupEndDate: '2026-07-31',
  setupEndTime: '00:00',
  teardownStartDate: '2026-08-03',
  teardownStartTime: '00:00',
  teardownEndDate: '2026-08-04',
  teardownEndTime: '00:00',
  accessPermit: [],
  certifications: [],
  eventDocuments: [],
  venueLayouts: [],
  logisticComment: '',
  // Helping hands
  assemblyPlanograms: [],
  helpingHandComment: '',
};

const fieldErrors = (data: unknown) => {
  const result = eventFormSchema.safeParse(data);
  expect(result.success).toBe(false);
  return result.success ? {} : result.error.flatten().fieldErrors;
};

describe('eventFormSchema', () => {
  it('accepts a fully valid Overview + Logistics + Helping Hands payload', () => {
    expect(eventFormSchema.safeParse(validEventForm).success).toBe(true);
  });

  it('accepts Setup and Teardown ranges overlapping the Event because overlap is only a warning', () => {
    expect(eventFormSchema.safeParse({
      ...validEventForm,
      setupStartDate: '2026-08-01', setupEndDate: '2026-08-02',
      teardownStartDate: '2026-08-01', teardownEndDate: '2026-08-02',
    }).success).toBe(true);
  });

  it('rejects every required Overview field when empty', () => {
    const errors = fieldErrors({
      ...validEventForm,
      customEventId: '',
      title: '',
      mode: '',
      targetAudience: [],
      eventTypeId: '',
      shortDescription: '',
      participation: '',
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
      partnershipTypes: [],
    });

    // contactPhone is `zPhone()` with no `'required'` rule — an empty string short-circuits
    // its own superRefine (`if (!val) return;`) and never becomes a field error, confirmed
    // by running this test against the real schema.
    expect(Object.keys(errors)).toEqual([
      'customEventId', 'title', 'mode', 'targetAudience', 'eventTypeId',
      'shortDescription', 'participation', 'images', 'startDate', 'startTime', 'endDate', 'endTime',
      'address', 'street', 'zipCode', 'city',
      'contactFirstName', 'contactLastName', 'contactEmail', 'partnershipTypes',
    ]);
    expect(errors).not.toHaveProperty('contactPhone');
  });

  it('rejects an empty images array', () => {
    expect(fieldErrors({ ...validEventForm, images: [] })).toHaveProperty('images');
  });

  it('does not require the admin contact phone number to be non-empty', () => {
    expect(eventFormSchema.safeParse({ ...validEventForm, contactPhone: '' }).success).toBe(true);
  });

  it('rejects a whitespace-only Event title', () => {
    expect(fieldErrors({ ...validEventForm, title: '   ' })).toHaveProperty('title');
  });

  it('does not validate the optional link as a URL', () => {
    // docs/specs/events.md and testcase/event-navigator flag this as unconfirmed with the
    // business — the schema currently accepts any string, including a malformed URL.
    expect(eventFormSchema.safeParse({ ...validEventForm, link: 'not-a-url' }).success).toBe(true);
  });

  it('rejects a description longer than 5,000 characters', () => {
    expect(fieldErrors({ ...validEventForm, shortDescription: 'a'.repeat(5001) }))
      .toHaveProperty('shortDescription');
  });

  it('accepts a description at exactly 5,000 characters', () => {
    expect(
      eventFormSchema.safeParse({ ...validEventForm, shortDescription: 'a'.repeat(5000) }).success,
    ).toBe(true);
  });

  it('rejects an invalid admin contact email', () => {
    expect(fieldErrors({ ...validEventForm, contactEmail: 'not-an-email' }))
      .toHaveProperty('contactEmail');
  });

  it('rejects an invalid admin contact phone number', () => {
    expect(fieldErrors({ ...validEventForm, contactPhone: 'not-a-phone' }))
      .toHaveProperty('contactPhone');
  });

  it('rejects an additional contact missing name, role, email, or phone', () => {
    const errors = fieldErrors({
      ...validEventForm,
      contacts: [{ contactName: '', contactEmail: '', contactPhone: '', role: undefined }],
    });

    expect(errors).toHaveProperty('contacts');
  });

  it('rejects an additional contact missing only the role', () => {
    const errors = fieldErrors({
      ...validEventForm,
      contacts: [{ contactName: 'Contact Person', contactEmail: 'contact@example.com', contactPhone: '+491701234500', role: undefined }],
    });

    expect(errors).toHaveProperty('contacts');
  });

  it('accepts a complete additional contact', () => {
    expect(
      eventFormSchema.safeParse({
        ...validEventForm,
        contacts: [
          {
            contactName: 'Contact Person',
            contactEmail: 'contact@example.com',
            contactPhone: '+491701234500',
            role: 'ADMIN',
          },
        ],
      }).success,
    ).toBe(true);
  });

  it('rejects an empty targetAudience array', () => {
    expect(fieldErrors({ ...validEventForm, targetAudience: [] })).toHaveProperty('targetAudience');
  });

  it('rejects an empty partnershipTypes array', () => {
    expect(fieldErrors({ ...validEventForm, partnershipTypes: [] })).toHaveProperty('partnershipTypes');
  });

  it('rejects Product Partner selected without any productPartnerCategories', () => {
    expect(
      fieldErrors({
        ...validEventForm,
        partnershipTypes: ['PRODUCT_PARTNER'],
        productPartnerCategories: [],
      }),
    ).toHaveProperty('productPartnerCategories');
  });

  it('accepts Product Partner selected with at least one category', () => {
    expect(
      eventFormSchema.safeParse({
        ...validEventForm,
        partnershipTypes: ['PRODUCT_PARTNER'],
        productPartnerCategories: ['SOFTDRINKS'],
      }).success,
    ).toBe(true);
  });

  it.each([
    ['2026-08-01', '09:00', '2026-08-01', '09:00'],
    ['2026-08-02', '09:00', '2026-08-01', '17:00'],
  ])('rejects Event end %s %s when not after start %s %s', (startDate, startTime, endDate, endTime) => {
    expect(fieldErrors({ ...validEventForm, startDate, startTime, endDate, endTime }))
      .toHaveProperty('endDate');
  });

  it('accepts Event end exactly one minute after start', () => {
    expect(
      eventFormSchema.safeParse({
        ...validEventForm,
        startDate: '2026-08-01',
        startTime: '09:00',
        endDate: '2026-08-01',
        endTime: '09:01',
      }).success,
    ).toBe(true);
  });

  it('rejects every required Logistics field when empty', () => {
    const errors = fieldErrors({
      ...validEventForm,
      wareHouseCode: '',
      logisticsContactName: '',
      logisticsContactEmail: '',
      logisticsContactPhone: '',
      setupStartDate: '',
      setupStartTime: '',
      setupEndDate: '',
      setupEndTime: '',
      teardownStartDate: '',
      teardownStartTime: '',
      teardownEndDate: '',
      teardownEndTime: '',
    });

    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining([
        'wareHouseCode', 'logisticsContactName', 'logisticsContactEmail',
        'logisticsContactPhone', 'setupStartDate', 'setupEndDate',
        'teardownStartDate', 'teardownEndDate',
      ]),
    );
  });

  it.each([
    ['2026-07-30', '00:00', '2026-07-30', '00:00'],
    ['2026-07-31', '00:00', '2026-07-30', '00:00'],
  ])('rejects Setup end %s %s when not after start %s %s', (startDate, startTime, endDate, endTime) => {
    expect(
      fieldErrors({
        ...validEventForm,
        setupStartDate: startDate,
        setupStartTime: startTime,
        setupEndDate: endDate,
        setupEndTime: endTime,
      }),
    ).toHaveProperty('setupStartDate');
  });

  it.each([
    ['2026-08-03', '00:00', '2026-08-03', '00:00'],
    ['2026-08-04', '00:00', '2026-08-03', '00:00'],
  ])('rejects Teardown end %s %s when not after start %s %s', (startDate, startTime, endDate, endTime) => {
    expect(
      fieldErrors({
        ...validEventForm,
        teardownStartDate: startDate,
        teardownStartTime: startTime,
        teardownEndDate: endDate,
        teardownEndTime: endTime,
      }),
    ).toHaveProperty('teardownStartDate');
  });

  it('rejects an enabled different-delivery-address entry missing address, street, zip, or city', () => {
    const errors = fieldErrors({
      ...validEventForm,
      isDifferentDeliveryAddress: true,
      deliveryLocations: [
        { eventLocation: 'loc-1', deliveryAddress: '', deliveryStreet: '', deliveryZipCode: '', deliveryCity: '' },
      ],
    });

    expect(errors).toHaveProperty('deliveryLocations');
  });

  it('accepts a complete different-delivery-address entry', () => {
    expect(
      eventFormSchema.safeParse({
        ...validEventForm,
        isDifferentDeliveryAddress: true,
        deliveryLocations: [
          {
            eventLocation: 'loc-1',
            deliveryAddress: 'Warehouse A',
            deliveryStreet: 'Lagerstraße 1',
            deliveryZipCode: '80331',
            deliveryCity: 'München',
          },
        ],
      }).success,
    ).toBe(true);
  });

  it('does not require delivery address fields when isDifferentDeliveryAddress is false', () => {
    expect(
      eventFormSchema.safeParse({
        ...validEventForm,
        isDifferentDeliveryAddress: false,
        deliveryLocations: [
          { eventLocation: '', deliveryAddress: '', deliveryStreet: '', deliveryZipCode: '', deliveryCity: '' },
        ],
      }).success,
    ).toBe(true);
  });

  it('assigns STEP_FIELDS only to the two data-entry steps with per-step validated fields', () => {
    expect(STEP_FIELDS.overview).toContain('customEventId');
    expect(STEP_FIELDS.overview).toContain('partnershipTypes');
    expect(STEP_FIELDS.logistics).toContain('wareHouseCode');
    expect(STEP_FIELDS.helping_hand).toEqual(['assemblyPlanograms', 'helpingHandComment']);
    expect(STEP_FIELDS.product_catalog).toEqual([]);
    expect(STEP_FIELDS.summary).toEqual([]);
  });

  it('excludes link from the Overview step-trigger fields and includes images', () => {
    expect(STEP_FIELDS.overview).not.toContain('link');
    expect(STEP_FIELDS.overview).toContain('images');
  });
});
