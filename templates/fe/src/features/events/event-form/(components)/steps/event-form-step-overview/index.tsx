'use client';

import { useEffect } from 'react';
import { useFormContext, Controller, useWatch, useFormState } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { InfoIcon } from 'lucide-react';
import { useQueryState, parseAsString } from 'nuqs';
import { InputFloat } from '@/shared/components/ui/input-float';
import { SelectFloat } from '@/shared/components/ui/select-float';
import { SelectItem } from '@/shared/components/ui/select';
import { TextareaFloat } from '@/shared/components/ui/textarea-float';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EVENT_MODE_OPTIONS, TARGET_AUDIENCE_OPTIONS, PARTICIPATION_OPTIONS } from '../../../(helpers)/event-form-constants';
import { ImagesCard } from './images-card';
import { DateCard } from './date-card';
import { LocationCard } from './location-card';
import { ContactCard } from './contact-card';
import { PartnershipCard } from './partnership-card';
import { EventIdField } from './event-id-field';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';
import { useUnsavedChanges } from '@/shared/hooks/common/use-unsaved-changes';
import { UnsavedChangesDialog } from '@/shared/components/common/unsaved-changes-dialog';
import { useSubmitStepOverview } from '../../../(hooks)/use-submit-step-overview';
import { useGetEventType } from '@/features/events/event-form/(hooks)/use-get-event-type';
import { usePermanentLoanPrivacy } from '@/features/events/event-form/(hooks)/use-permanent-loan-privacy';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { useSubmitCalendarEvent } from '@/features/calendar/calendar-event-form/(hooks)/use-submit-calendar-event';
import type { EventFormVariant } from '../../../(helpers)/event-form-config';

const DESCRIPTION_MAX = 5000;

type Props = {
  showParticipation?: boolean;
  variant?: EventFormVariant;
};

export function EventFormStepOverview({ showParticipation = true, variant = 'events' }: Props) {
  const t = useTranslations('eventForm');
  const { register, control, setValue, getValues, reset } = useFormContext<EventFormDto>();
  const { errors, isDirty } = useFormState<EventFormDto>();
  const { eventTypes } = useGetEventType();
  const { isPermanentLoan, applyEventTypePrivacy } = usePermanentLoanPrivacy();
  const { submit: submitEventOverview } = useSubmitStepOverview();
  const { submit: submitCalendarEvent } = useSubmitCalendarEvent({ redirectAfterSubmit: false });
  const submit = variant === 'calendar' ? submitCalendarEvent : submitEventOverview;
  const { dialogProps } = useUnsavedChanges({
    isDirty,
    onDiscard: () => reset(),
    onSave: async () => {
      if (!await submit()) return false;
      reset(getValues());
    },
  });

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const canEdit = useEventDetailStore((s) => s.canEdit);
  const isOverviewLocked = useEventDetailStore((s) => s.isOverviewLocked);
  const isDisableField = (eventIdParam ? !canEdit : false) || isOverviewLocked;

  useEffect(() => {
    const isCreateMode = !eventIdParam;
    if (isCreateMode && !getValues('customEventId')) {
      const random5Digits = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, '0');
      const generatedId = `EVENT-10${random5Digits}`;
      setValue('customEventId', generatedId);
    }
  }, [eventIdParam, setValue, getValues]);

  const watched = useWatch<EventFormDto>();
  const titleValue = watched.title ?? '';
  const shortDescriptionValue = watched.shortDescription ?? '';
  const linkValue = watched.link ?? '';
  const targetAudienceOptions = TARGET_AUDIENCE_OPTIONS;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('overview.sectionTitle')}</CardTitle>
          <CardDescription>{t('overview.sectionSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputFloat
            data-testid="event-title-input"
            label={t('overview.eventTitle')}
            value={titleValue}
            error={errors.title?.message}
            disabled={isDisableField}
            {...register('title')}
          />

          <div data-field="mode" data-testid="event-mode-select">
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <SelectFloat
                  label={t('overview.eventMode')}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.mode?.message}
                  disabled={isDisableField}
                >
                  {EVENT_MODE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} data-testid={`event-mode-option-${o.value}`}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectFloat>
              )}
            />
          </div>

          <div data-field="targetAudience" data-testid="event-target-audience-select">
            <Controller
              name="targetAudience"
              control={control}
              render={({ field }) => (
                <SelectFloat
                  label={t('overview.targetAudience')}
                  multiple
                  values={field.value ?? []}
                  onValuesChange={field.onChange}
                  options={targetAudienceOptions}
                  hint={t('overview.targetAudienceHint')}
                  error={errors.targetAudience?.message}
                  disabled={isDisableField}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <EventIdField disabled={isDisableField} />
            <div data-field="eventTypeId" data-testid="event-type-select">
              <Controller
                name="eventTypeId"
                control={control}
                render={({ field }) => (
                  <SelectFloat
                    label={t('overview.eventType')}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      applyEventTypePrivacy(value);
                    }}
                    error={errors.eventTypeId?.message}
                    disabled={isDisableField}
                  >
                    {eventTypes.map((o) => (
                      <SelectItem key={o.id} value={o.id} data-testid={`event-type-option-${o.id}`}>{o.name}</SelectItem>
                    ))}
                  </SelectFloat>
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Controller
              name="doNotPublish"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="doNotPublish"
                  checked={isPermanentLoan || field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPermanentLoan || isDisableField}
                />
              )}
            />
            <Label htmlFor="doNotPublish" className="cursor-pointer text-sm">
              {t('overview.doNotPublish')}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="size-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>{t('overview.doNotPublishHint')}</TooltipContent>
            </Tooltip>
          </div>

          <div>
            <div className="mb-1 flex justify-end text-xs text-muted-foreground">
              <span>{shortDescriptionValue.length}/{DESCRIPTION_MAX}</span>
            </div>
            <TextareaFloat
              data-testid="event-description-textarea"
              label={t('overview.descriptionPlaceholder')}
              value={shortDescriptionValue}
              error={errors.shortDescription?.message}
              disabled={isDisableField}
              {...register('shortDescription')}
            />
          </div>

          {showParticipation && (
            <div data-field="participation" data-testid="event-participation-select">
              <Controller
                name="participation"
                control={control}
                render={({ field }) => (
                  <SelectFloat
                    label={t('overview.participation')}
                    value={field.value}
                    onValueChange={field.onChange}
                    error={errors.participation?.message}
                    disabled={isDisableField}
                  >
                    {PARTICIPATION_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} data-testid={`event-participation-option-${o.value}`}>
                        {t(`overview.participationOptions.${o.labelKey}`)}
                      </SelectItem>
                    ))}
                  </SelectFloat>
                )}
              />
            </div>
          )}

          <InputFloat
            label={t('overview.linkToEvent')}
            value={linkValue}
            type="url"
            disabled={isDisableField}
            {...register('link')}
          />
        </CardContent>
      </Card>

      <ImagesCard />
      <DateCard />
      <LocationCard />
      <ContactCard />
      <PartnershipCard />
      <UnsavedChangesDialog {...dialogProps} />
    </div>
  );
}
