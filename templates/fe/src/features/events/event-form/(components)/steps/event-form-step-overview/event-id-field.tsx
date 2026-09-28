'use client';

import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { InputFloat } from '@/shared/components/ui/input-float';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';

type Props = { disabled?: boolean };

export function EventIdField({ disabled }: Props) {
  const t = useTranslations('eventForm');
  const { control, register } = useFormContext<EventFormDto>();
  const { errors } = useFormState<EventFormDto>({ control, name: 'customEventId' });
  const value = useWatch({ control, name: 'customEventId' }) ?? '';

  return (
    <InputFloat
      label={t('overview.eventId')}
      value={value}
      error={errors.customEventId?.message}
      disabled={disabled}
      {...register('customEventId')}
    />
  );
}
