'use client';

import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { dayjs } from '@/lib/date-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DateInputFloat } from '@/shared/components/ui/date-input-float';
import type { TradeFairEventFormDto } from '../../../(helpers)/trade-fair-event-form-schema';

export function DateCard() {
  const t = useTranslations('reportingTool.tradeFairEventForm.generalInfo');
  const { setValue, control } = useFormContext<TradeFairEventFormDto>();
  const { errors } = useFormState<TradeFairEventFormDto>();

  const startDate = useWatch({ control, name: 'startDate' });
  const startTime = useWatch({ control, name: 'startTime' });
  const endDate = useWatch({ control, name: 'endDate' });
  const endTime = useWatch({ control, name: 'endTime' });

  const startDateTime = startDate
    ? dayjs.utc(`${startDate}T${startTime || '00:00'}`).toDate()
    : null;

  const endDateTime = endDate
    ? dayjs.utc(`${endDate}T${endTime || '00:00'}`).toDate()
    : null;

  const handleStartChange = (date: Date) => {
    const newStart = dayjs.utc(date);
    setValue('startDate', newStart.format('YYYY-MM-DD'), { shouldDirty: true, shouldValidate: true });
    setValue('startTime', newStart.format('HH:mm'), { shouldDirty: true, shouldValidate: true });

    const currentEnd = endDate ? dayjs.utc(`${endDate}T${endTime || '00:00'}`) : null;
    if (!currentEnd || currentEnd.valueOf() <= newStart.valueOf()) {
      const newEnd = newStart.add(1, 'day');
      setValue('endDate', newEnd.format('YYYY-MM-DD'), { shouldDirty: true, shouldValidate: true });
      setValue('endTime', newStart.format('HH:mm'), { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleEndChange = (date: Date) => {
    setValue('endDate', dayjs.utc(date).format('YYYY-MM-DD'), { shouldDirty: true, shouldValidate: true });
    setValue('endTime', dayjs.utc(date).format('HH:mm'), { shouldDirty: true, shouldValidate: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('dateTitle')}
          <span className="text-red-500"> *</span>
        </CardTitle>
        <CardDescription>{t('dateSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1" data-field="startDate">
          <p className="text-sm font-medium text-foreground">{t('eventStart')}</p>
          <DateInputFloat
            overlay="dialog"
            value={startDateTime}
            onChangeAction={handleStartChange}
            dateLabel={t('date')}
            timeLabel={t('time')}
            datePlaceholder="DD/MM/YYYY"
            timePlaceholder="HH:MM"
            allowPastDates={false}
            error={errors.startDate?.message ?? errors.startTime?.message}
          />
        </div>

        <div className="flex flex-col gap-1" data-field="endDate">
          <p className="text-sm font-medium text-foreground">{t('eventEnd')}</p>
          <DateInputFloat
            overlay="dialog"
            value={endDateTime}
            onChangeAction={handleEndChange}
            dateLabel={t('date')}
            timeLabel={t('time')}
            datePlaceholder="DD/MM/YYYY"
            timePlaceholder="HH:MM"
            allowPastDates={false}
            error={errors.endDate?.message ?? errors.endTime?.message}
          />
        </div>
      </CardContent>
    </Card>
  );
}
