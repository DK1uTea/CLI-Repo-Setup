'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useUploadEventFiles } from '@/features/events/event-form/(hooks)/use-upload-event-files';
import {
  EVENT_COMMON_DOCUMENTS_DEFAULT_VALUES,
  eventCommonDocumentsSchema,
  type EventCommonDocumentsFormInput,
  type EventCommonDocumentsFormValues,
} from '../(helpers)/event-common-documents-schema';
import { useCreateEventTask } from './use-create-event-task';

function scrollToServiceField() {
  const field = document.querySelector<HTMLElement>('[data-field="service"]');
  field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  field?.querySelector<HTMLElement>('button, [role="combobox"]')?.focus();
}

export function useEventCommonDocumentsForm(eventId: string) {
  const createTask = useCreateEventTask();
  const { uploadFiles, isUploading } = useUploadEventFiles();
  const form = useForm<EventCommonDocumentsFormInput, unknown, EventCommonDocumentsFormValues>({
    resolver: zodResolver(eventCommonDocumentsSchema),
    defaultValues: EVENT_COMMON_DOCUMENTS_DEFAULT_VALUES,
  });

  const submit = (submitMode: EventCommonDocumentsFormInput['submitMode']) => {
    form.setValue('submitMode', submitMode);
    return form.handleSubmit(async (values) => {
      const comment = values.comment.trim();
      if (values.submitMode === 'comment') {
        await createTask.mutateAsync({ eventId, service: values.service, comment });
        form.reset({ ...values, submitMode: 'comment', comment: '' });
        return;
      }

      const rawFiles = values.files.flatMap((item) => item.file ? [item.file] : []);
      const uploaded = await uploadFiles(rawFiles, 'event');
      await createTask.mutateAsync({
        eventId,
        service: values.service,
        files: uploaded.map((file) => file.url),
        ...(comment ? { comment } : {}),
      });
      form.reset({ ...values, submitMode: 'comment', comment: '', files: [] });
    }, (errors) => {
      if (errors.service) scrollToServiceField();
    })();
  };

  return {
    form,
    submitComment: () => submit('comment'),
    submitFiles: () => submit('save'),
    isPending: createTask.isPending || isUploading,
  };
}
