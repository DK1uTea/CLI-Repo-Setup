'use client';

import { useEffect } from 'react';
import { Controller, useFormContext, useFormState } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { translateErrorMessage } from '@/lib/field-error';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { InputFloat } from '@/shared/components/ui/input-float';
import { SelectItem } from '@/shared/components/ui/select';
import { SelectFloat } from '@/shared/components/ui/select-float';
import { TextareaFloat } from '@/shared/components/ui/textarea-float';
import {
  EVENT_MODE_OPTIONS,
  TARGET_AUDIENCE_OPTIONS,
} from '@/features/events/event-form/(helpers)/event-form-constants';
import type { TradeFairEventFormDto } from '../../../(helpers)/trade-fair-event-form-schema';
import { TRADE_FAIR_PARTICIPATION_OPTIONS } from '../../../(helpers)/trade-fair-event-form-constants';
import { useTradeFairEventType } from '../../../(hooks)/use-trade-fair-event-type';

const DESCRIPTION_MAX = 5000;

export function EventInfoCard() {
  const t = useTranslations('reportingTool.tradeFairEventForm.generalInfo');
  const { control, setValue, getValues } = useFormContext<TradeFairEventFormDto>();
  const { errors } = useFormState<TradeFairEventFormDto>();
  const { eventTypes } = useTradeFairEventType();
  const [id] = useQueryState('id', parseAsString);

  useEffect(() => {
    if (!id && !getValues('eventId')) {
      const generateEventCode = () => {
        const digits = Math.floor(1000000 + Math.random() * 9000000);
        return `EVENT-${digits}`;
      };
      setValue('eventId', generateEventCode());
    }
  }, [id, getValues, setValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('sectionTitle')}
          <span className="text-red-500"> *</span>
        </CardTitle>
        <CardDescription>{t('sectionSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <InputFloat
              {...field}
              value={field.value ?? ''}
              label={t('eventTitle')}
              error={errors.title?.message}
            />
          )}
        />

        <div data-field="eventMode">
          <Controller
            name="eventMode"
            control={control}
            render={({ field }) => (
              <SelectFloat
                label={t('eventMode')}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.eventMode?.message}
              >
                {EVENT_MODE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectFloat>
            )}
          />
        </div>

        <div data-field="targetAudience">
          <Controller
            name="targetAudience"
            control={control}
            render={({ field }) => (
              <SelectFloat
                label={t('targetAudience')}
                value={field.value?.[0] ?? ''}
                onValueChange={(value) => field.onChange(value ? [value] : [])}
                error={errors.targetAudience?.message}
              >
                {TARGET_AUDIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectFloat>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="eventId"
            control={control}
            render={({ field }) => (
              <InputFloat
                {...field}
                value={field.value ?? ''}
                label={t('eventId')}
                error={translateErrorMessage(errors.eventId?.message)}
              />
            )}
          />
          <div data-field="eventType">
            <Controller
              name="eventType"
              control={control}
              render={({ field }) => (
                <SelectFloat
                  label={t('eventType')}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.eventType?.message}
                >
                  {eventTypes.map((eventType) => (
                    <SelectItem key={eventType.value} value={eventType.value}>
                      {t(`eventTypeOptions.${eventType.value}`)}
                    </SelectItem>
                  ))}
                </SelectFloat>
              )}
            />
          </div>
        </div>

        <div>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextareaFloat
                {...field}
                value={field.value ?? ''}
                label={t('descriptionPlaceholder')}
                maxLength={DESCRIPTION_MAX}
                error={errors.description?.message}
              />
            )}
          />
        </div>

        <div data-field="participation">
          <Controller
            name="participation"
            control={control}
            render={({ field }) => (
              <SelectFloat
                label={t('participation')}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.participation?.message}
              >
                {TRADE_FAIR_PARTICIPATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(`participationOptions.${option.labelKey}`)}
                  </SelectItem>
                ))}
              </SelectFloat>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
