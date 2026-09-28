import { z } from 'zod';
import { zString, zBoolean, zEmail, zPhone } from '@/shared/schemas';
import { getValidationMessage } from '@/lib/field-error';

const calendarContactItemSchema = z.object({
  contactName: zString(['required']),
  contactEmail: zEmail(),
  contactPhone: zPhone(),
  role: zString(['required']),
});

// Field names mirror the shared step-overview UI 1:1 (which itself mirrors the
// real events API) so calendar can reuse EventFormStepOverview / LocationCard /
// PartnershipCard / EventFormSidebar without any per-field name translation.
export const calendarEventFormSchema = z
  .object({
    customEventId: zString(['required']),
    title: zString(['required']),
    mode: zString(['required']),
    targetAudience: z.array(zString()).min(1, getValidationMessage('fieldErrors.required')),
    eventTypeId: zString(['required']),
    doNotPublish: zBoolean(),
    shortDescription: zString(['required', 'max:5000']),
    participation: zString().optional(),
    link: zString().optional(),
    images: z.array(z.any()).min(1, getValidationMessage('fieldErrors.imageRequired')),
    startDate: zString(['required']),
    startTime: zString(['required']),
    endDate: zString(['required']),
    endTime: zString(['required']),
    locationId: zString().optional(),
    address: zString(['required']),
    street: zString(['required']),
    zipCode: zString(['required']),
    city: zString(['required']),
    isSaveAddress: zBoolean(),
    contactFirstName: zString(['required']),
    contactLastName: zString(['required']),
    contactEmail: zEmail(),
    contactPhone: zPhone(),
    contacts: z.array(calendarContactItemSchema),
    partnershipTypes: z.array(zString()),
    productPartnerCategories: z.array(zString()),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
      const start = `${data.startDate}T${data.startTime ?? '00:00'}`;
      const end = `${data.endDate}T${data.endTime ?? '00:00'}`;
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: getValidationMessage('fieldErrors.endDateAfterStartDate'),
          path: ['endDate'],
        });
      }
    }

    if (
      data.partnershipTypes?.includes('PRODUCT_PARTNER') &&
      (!data.productPartnerCategories || data.productPartnerCategories.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: getValidationMessage('fieldErrors.required'),
        path: ['productPartnerCategories'],
      });
    }
  });

export type CalendarEventFormDto = z.infer<typeof calendarEventFormSchema>;

export const CALENDAR_OVERVIEW_FIELDS: readonly (keyof CalendarEventFormDto)[] = [
  'customEventId', 'title', 'mode', 'targetAudience', 'eventTypeId',
  'doNotPublish', 'shortDescription',
  'images',
  'startDate', 'startTime', 'endDate', 'endTime',
  'locationId', 'address', 'street', 'zipCode', 'city', 'isSaveAddress',
  'contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone',
  'contacts', 'partnershipTypes', 'productPartnerCategories',
];
