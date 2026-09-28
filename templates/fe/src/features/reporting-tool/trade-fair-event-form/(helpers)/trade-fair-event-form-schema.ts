import { z } from 'zod';
import { getValidationMessage } from '@/lib/field-error';
import { zBoolean, zString } from '@/shared/schemas';
import type { StepName } from './trade-fair-event-form-config';

const generalInfoSchema = z.object({
  eventId: zString(['required']),
  title: zString(['required']),
  eventMode: zString(),
  targetAudience: z.array(z.string()),
  eventType: zString(['required']),
  description: zString(['max:5000']),
  participation: zString(),
  images: z.array(z.any()).min(1, getValidationMessage('fieldErrors.imageRequired')),
  startDate: zString(['required']),
  startTime: zString(['required']),
  endDate: zString(['required']),
  endTime: zString(['required']),
  eventLocation: z.string().optional(),
  locationId: z.string().optional(),
  address: zString(['required']),
  street: zString(['required']),
  zipCode: zString(['required']),
  city: zString(['required']),
  isSaveLocation: zBoolean(),
});

const surveySchema = z.object({
  surveys: z
    .array(
      z.object({
        surveyId: z.string(),
        requiredLogin: z.boolean(),
      }),
    )
    .min(1, getValidationMessage('fieldErrors.required')),
});

export const tradeFairEventFormSchema = z
  .object({
    ...generalInfoSchema.shape,
    ...surveySchema.shape,
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
  });

export type TradeFairEventFormDto = z.infer<typeof tradeFairEventFormSchema>;

export const STEP_FIELDS: Record<StepName, readonly (keyof TradeFairEventFormDto)[]> = {
  'general-info': [
    'eventId',
    'title',
    'eventMode',
    'targetAudience',
    'eventType',
    'description',
    'participation',
    'images',
    'startDate',
    'startTime',
    'endDate',
    'endTime',
    'eventLocation',
    'locationId',
    'address',
    'street',
    'zipCode',
    'city',
    'isSaveLocation',
  ],
  survey: ['surveys'],
  'assign-team': [],
  'review-launch': [],
};
