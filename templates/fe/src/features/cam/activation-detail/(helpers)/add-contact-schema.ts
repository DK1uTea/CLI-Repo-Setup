import { z } from 'zod';
import { zString, zEmail } from '@/shared/schemas';
import { getValidationMessage } from '@/lib/field-error';

const PHONE_REGEX = /^\+?\d{5,20}$/;
const PHONE_DIAL_CODE_ONLY_REGEX = /^\+\d{1,4}$/;

const baseContactSchema = z.object({
  contactId: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  email: zString(['required']).pipe(zEmail()),
  address: z.string(),
});

export function getAddContactSchema(requireContactFields: boolean) {
  return baseContactSchema.superRefine((values, ctx) => {
    if (!requireContactFields) return;

    if (!values.firstName.trim()) {
      ctx.addIssue({ code: 'custom' as const, path: ['firstName'], message: getValidationMessage('fieldErrors.required') });
    }
    if (!values.lastName.trim()) {
      ctx.addIssue({ code: 'custom' as const, path: ['lastName'], message: getValidationMessage('fieldErrors.required') });
    }
    const normalizedPhone = values.phone.replace(/\s/g, '');
    if (!normalizedPhone.trim() || PHONE_DIAL_CODE_ONLY_REGEX.test(normalizedPhone)) {
      ctx.addIssue({ code: 'custom' as const, path: ['phone'], message: getValidationMessage('fieldErrors.required') });
    } else if (!PHONE_REGEX.test(normalizedPhone)) {
      ctx.addIssue({ code: 'custom' as const, path: ['phone'], message: getValidationMessage('fieldErrors.phoneNumber') });
    }
    if (!values.address.trim()) {
      ctx.addIssue({ code: 'custom' as const, path: ['address'], message: getValidationMessage('fieldErrors.required') });
    }
  });
}

export type AddContactFormValues = z.infer<typeof baseContactSchema>;

export const addContactDefaultValues: AddContactFormValues = {
  contactId: undefined,
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
};
