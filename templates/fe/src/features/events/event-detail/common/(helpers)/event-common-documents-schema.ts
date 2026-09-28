import { z } from 'zod';
import { getValidationMessage } from '@/lib/field-error';
import { zString } from '@/shared/schemas';
import type { UploadFile } from '@/shared/components/ui/upload-dropzone';
import type { EventTaskService } from '../(services)/event-common-service';

const serviceSchema = zString(['required'])
  .refine((value): value is EventTaskService => ['AUFBAU', 'ABBAU', 'DEFEKT', 'OTHER'].includes(value), {
    message: getValidationMessage('fieldErrors.required'),
  });

const commonFields = {
  service: serviceSchema,
  files: z.custom<UploadFile[]>().catch([]),
};

export const eventCommonDocumentsSchema = z.discriminatedUnion('submitMode', [
  z.object({
    ...commonFields,
    submitMode: z.literal('comment'),
    comment: zString(['required']),
  }),
  z.object({
    ...commonFields,
    submitMode: z.literal('save'),
    comment: zString(),
    files: z.custom<UploadFile[]>().refine(
      (files) => Array.isArray(files) && files.some((item) => item.file instanceof File),
      { message: getValidationMessage('fieldErrors.required') },
    ),
  }),
]);

export type EventCommonDocumentsFormValues = z.infer<typeof eventCommonDocumentsSchema>;

export type EventCommonDocumentsFormInput = z.input<typeof eventCommonDocumentsSchema>;

export const EVENT_COMMON_DOCUMENTS_DEFAULT_VALUES: EventCommonDocumentsFormInput = {
  submitMode: 'comment',
  service: '',
  comment: '',
  files: [],
};
