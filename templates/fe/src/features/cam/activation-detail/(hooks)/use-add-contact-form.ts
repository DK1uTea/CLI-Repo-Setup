'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  addContactDefaultValues,
  getAddContactSchema,
  type AddContactFormValues,
} from '../(helpers)/add-contact-schema';

export function useAddContactForm(requireContactFields: boolean) {
  return useForm<AddContactFormValues>({
    mode: 'onChange',
    resolver: zodResolver(getAddContactSchema(requireContactFields)),
    defaultValues: addContactDefaultValues,
  });
}
