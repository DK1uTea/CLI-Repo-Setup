import { z } from 'zod';
import { zString, zBoolean, zEmail, zPhone } from '@/shared/schemas';
import { getValidationMessage } from '@/lib/field-error';
import { EVENT_CONTACT_ROLES } from './event-form-constants';

export const STEP_NAMES = ['overview', 'logistics', 'product_catalog', 'helping_hand', 'summary'] as const;
export type StepName = (typeof STEP_NAMES)[number];
export const EVENT_FORM_TOTAL_STEPS = STEP_NAMES.length;

const contactItemSchema = z.object({
  contactName: zString(['required']),
  contactEmail: zEmail(),
  contactPhone: zPhone(),
  role: z.enum(EVENT_CONTACT_ROLES, {
    message: getValidationMessage('fieldErrors.required'),
  }),
});

const deliveryLocationSchema = z.object({
  eventLocation: zString().optional(),
  deliveryAddress: zString().optional(),
  deliveryStreet: zString().optional(),
  deliveryZipCode: zString().optional(),
  deliveryCity: zString().optional(),
  isGenerateAddress: zBoolean().optional(),
});

const overviewSchema = z.object({
  // Basic info
  customEventId: zString(['required']),
  title: zString(['required']),
  mode: zString(['required']),
  targetAudience: z
    .array(zString())
    .superRefine((val, ctx) => {
      if (!val || val.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: getValidationMessage('fieldErrors.required'),
        });
      }
    }),
  eventTypeId: zString(['required']),
  doNotPublish: zBoolean(),
  shortDescription: zString(['required', 'max:5000']),
  participation: zString(['required']),
  link: zString().optional(),
  // Images
  images: z.array(z.any()).min(1, getValidationMessage('fieldErrors.imageRequired')),
  // Date & time
  startDate: zString(['required']),
  startTime: zString(['required']),
  endDate: zString(['required']),
  endTime: zString(['required']),
  // Location (select is optional, but the 4 address fields are required)
  locationId: zString().optional(),
  address: zString(['required']),
  street: zString(['required']),
  zipCode: zString(['required']),
  city: zString(['required']),
  isSaveAddress: zBoolean(),
  // Admin contact
  contactFirstName: zString(['required']),
  contactLastName: zString(['required']),
  contactEmail: zEmail(),
  contactPhone: zPhone(),
  contacts: z.array(contactItemSchema),
  // Partnership
  partnershipTypes: z
    .array(zString())
    .superRefine((val, ctx) => {
      if (!val || val.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: getValidationMessage('fieldErrors.required'),
        });
      }
    }),
  productPartnerCategories: z.array(zString()),
});

const helpingHandsSchema = z.object({
  assemblyPlanograms: z.array(z.any()).optional(),
  helpingHandComment: zString().optional(),
});

const logisticsSchema = z.object({
  wareHouseCode: zString(['required']),
  logisticsContactName: zString(['required']),
  logisticsContactEmail: zEmail(),
  logisticsContactPhone: zPhone(['required']),
  isDifferentDeliveryAddress: zBoolean(),
  deliveryLocations: z.array(deliveryLocationSchema).optional(),
  setupStartDate: zString(['required']),
  setupStartTime: zString(['required']),
  setupEndDate: zString(['required']),
  setupEndTime: zString(['required']),
  teardownStartDate: zString(['required']),
  teardownStartTime: zString(['required']),
  teardownEndDate: zString(['required']),
  teardownEndTime: zString(['required']),
  accessPermit: z.array(z.any()).optional(),
  certifications: z.array(z.any()).optional(),
  eventDocuments: z.array(z.any()).optional(),
  venueLayouts: z.array(z.any()).optional(),
  logisticComment: zString().optional(),
});

export const eventFormSchema = z
  .object({
    ...overviewSchema.shape,
    ...logisticsSchema.shape,
    ...helpingHandsSchema.shape,
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

    if (data.isDifferentDeliveryAddress && data.deliveryLocations?.length) {
      data.deliveryLocations.forEach((loc, index) => {
        const requiredFields = ['deliveryAddress', 'deliveryStreet', 'deliveryZipCode', 'deliveryCity'] as const;
        for (const field of requiredFields) {
          if (!loc[field]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: getValidationMessage('fieldErrors.required'),
              path: ['deliveryLocations', index, field],
            });
          }
        }
      });
    }

    if (data.setupStartDate && data.setupEndDate) {
      const start = `${data.setupStartDate}T${data.setupStartTime ?? '00:00'}`;
      const end = `${data.setupEndDate}T${data.setupEndTime ?? '00:00'}`;
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: getValidationMessage('fieldErrors.setupStartBeforeEnd'),
          path: ['setupStartDate'],
        });
      }
    }

    if (data.teardownStartDate && data.teardownEndDate) {
      const start = `${data.teardownStartDate}T${data.teardownStartTime ?? '00:00'}`;
      const end = `${data.teardownEndDate}T${data.teardownEndTime ?? '00:00'}`;
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: getValidationMessage('fieldErrors.teardownStartBeforeEnd'),
          path: ['teardownStartDate'],
        });
      }
    }
  });

export type EventFormDto = z.infer<typeof eventFormSchema>;

export const STEP_FIELDS: Record<StepName, readonly (keyof EventFormDto)[]> = {
  overview: [
    'customEventId', 'title', 'mode', 'targetAudience', 'eventTypeId',
    'doNotPublish', 'shortDescription', 'participation',
    'images',
    'startDate', 'startTime', 'endDate', 'endTime',
    'locationId', 'address', 'street', 'zipCode', 'city', 'isSaveAddress',
    'contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone',
    'contacts', 'partnershipTypes', 'productPartnerCategories',
  ],
  logistics: [
    'wareHouseCode', 'logisticsContactName', 'logisticsContactEmail', 'logisticsContactPhone',
    'isDifferentDeliveryAddress', 'deliveryLocations',
    'setupStartDate', 'setupStartTime', 'setupEndDate', 'setupEndTime',
    'teardownStartDate', 'teardownStartTime', 'teardownEndDate', 'teardownEndTime',
    'accessPermit', 'certifications', 'eventDocuments', 'venueLayouts', 'logisticComment',
  ],
  product_catalog: [],
  helping_hand: ['assemblyPlanograms', 'helpingHandComment'],
  summary: [],
};
