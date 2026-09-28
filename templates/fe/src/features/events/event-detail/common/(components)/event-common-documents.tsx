'use client';

import { useRef } from 'react';
import { Controller, useFormState } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { UploadIcon, RotateCcwIcon, SendHorizonalIcon } from 'lucide-react';
import { translateErrorMessage } from '@/lib/field-error';
import { Card } from '@/shared/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { SelectItem } from '@/shared/components/ui/select';
import { SelectFloat } from '@/shared/components/ui/select-float';
import { Textarea } from '@/shared/components/ui/textarea';
import { UploadDropzone, type UploadFile } from '@/shared/components/ui/upload-dropzone';
import { ComponentGuard } from '@/shared/components/common/component-guard';
import { EVENT_COMMON_MANAGE_FILES_PERMISSION } from '../(helpers)/event-common-permissions';
import { EVENT_DOCUMENT_UPLOAD_ACCEPT } from '../(helpers)/event-common-documents-constants';
import { EVENT_COMMON_DOCUMENTS_DEFAULT_VALUES } from '../(helpers)/event-common-documents-schema';
import { useEventCommonDocumentsForm } from '../(hooks)/use-event-common-documents-form';
import { EventCommonDocumentsList } from './event-common-documents-list';
import { PROOF_SERVICES } from './event-common-proof-item';
import type { EventCommonNamespace } from '../(services)/event-common-service';

const SERVICES = PROOF_SERVICES;

type Props = { eventId: string; namespace: EventCommonNamespace };

export function EventCommonDocuments({ eventId, namespace }: Props) {
  const t = useTranslations(namespace);
  const proofDropzoneRef = useRef<HTMLDivElement>(null);
  const { form, submitComment, submitFiles, isPending } = useEventCommonDocumentsForm(eventId);
  const { errors } = useFormState({ control: form.control });

  return (
    <Card className="py-0">
      <Accordion type="single" collapsible defaultValue="open">
        <AccordionItem value="open" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline font-semibold text-lg">
            {t('documents')}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-5 h-auto!">
            <ComponentGuard requiredKeys={EVENT_COMMON_MANAGE_FILES_PERMISSION[namespace]}>
              <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
                <div data-field="service">
                  <Controller
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <SelectFloat
                        label={t('selectService')}
                        value={field.value}
                        onValueChange={field.onChange}
                        error={translateErrorMessage(errors.service?.message)}
                        className="w-75 max-w-full"
                      >
                        {SERVICES.map((service) => (
                          <SelectItem key={service.key} value={service.key}>{service.label}</SelectItem>
                        ))}
                      </SelectFloat>
                    )}
                  />
                </div>

                <div ref={proofDropzoneRef} className="space-y-2">
                  <Controller
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="event-task-comment">{t('comment')}</Label>
                        <Textarea
                          {...field}
                          id="event-task-comment"
                          rows={5}
                          placeholder={t('enterComment')}
                          aria-invalid={!!errors.comment}
                          aria-describedby={errors.comment ? 'event-task-comment-error' : undefined}
                          className="bg-background font-normal"
                        />
                      </div>
                    )}
                  />
                  {errors.comment && (
                    <p id="event-task-comment-error" role="alert" className="text-xs text-destructive">
                      {translateErrorMessage(errors.comment.message)}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-primary text-primary gap-2 hover:text-primary hover:bg-primary/5"
                      disabled={isPending}
                      onClick={() => void submitComment().catch(() => {})}
                    >
                      {t('comment')}
                      <SendHorizonalIcon />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('proofOfPerformance')}</p>
                  <Controller
                    control={form.control}
                    name="files"
                    render={({ field }) => (
                      <UploadDropzone
                        value={field.value as UploadFile[]}
                        onChange={field.onChange}
                        accept={EVENT_DOCUMENT_UPLOAD_ACCEPT}
                        invalid={!!errors.files}
                        label={t('proofOfPerformance')}
                        dropText={t('dropFiles')}
                        browseText={t('clickToBrowse')}
                        hintText={t('recommendSize')}
                      />
                    )}
                  />
                  {errors.files && <p role="alert" className="text-xs text-destructive">{t('filesRequired')}</p>}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-primary text-primary gap-2 hover:text-primary hover:bg-primary/5"
                    isLoading={isPending}
                    onClick={() => void submitFiles().catch(() => {})}
                  >
                    {t('save')}
                    <UploadIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full text-muted-foreground gap-2"
                    disabled={isPending}
                    onClick={() => form.reset(EVENT_COMMON_DOCUMENTS_DEFAULT_VALUES)}
                  >
                    {t('reset')}
                    <RotateCcwIcon className="size-4" />
                  </Button>
                </div>
              </form>
            </ComponentGuard>

            <div className="mt-6">
              <EventCommonDocumentsList
                eventId={eventId}
                namespace={namespace}
                onScrollToUpload={() => proofDropzoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
