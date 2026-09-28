import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useQueryState, parseAsString } from 'nuqs';
import { dayjs, nowUtc } from '@/lib/date-utils';
import { DateInputFloat } from '@/shared/components/ui/date-input-float';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { useEventDeadline } from '../../../(hooks)/use-event-deadline';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';

export function DateCard() {
  const t = useTranslations('eventForm');
  const { setValue, trigger, control } = useFormContext<EventFormDto>();
  const { errors } = useFormState<EventFormDto>();

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const canEdit = useEventDetailStore((s) => s.canEdit);
  const isOverviewLocked = useEventDetailStore((s) => s.isOverviewLocked);
  const isDisableField = (eventIdParam ? !canEdit : false) || isOverviewLocked;
  const { data: deadline } = useEventDeadline(true);
  const minDate = deadline ? dayjs.utc(deadline.deadline).startOf('day').toDate() : undefined;

  const startDate = useWatch({ control, name: 'startDate' });
  const startTime = useWatch({ control, name: 'startTime' });
  const endDate = useWatch({ control, name: 'endDate' });
  const endTime = useWatch({ control, name: 'endTime' });

  const startDateTime = startDate
    ? dayjs.utc(`${startDate}T${startTime || '00:00'}`).toDate()
    : nowUtc();

  const endDateTime = endDate
    ? dayjs.utc(`${endDate}T${endTime || '00:00'}`).toDate()
    : nowUtc();

  const handleStartChange = (date: Date) => {
    const newStart = dayjs.utc(date);
    setValue('startDate', newStart.format('YYYY-MM-DD'), { shouldValidate: true });
    setValue('startTime', newStart.format('HH:mm'), { shouldValidate: true });

    const currentEnd = endDate ? dayjs.utc(`${endDate}T${endTime || '00:00'}`) : null;
    if (!currentEnd || currentEnd.valueOf() <= newStart.valueOf()) {
      const newEnd = newStart.add(1, 'day');
      setValue('endDate', newEnd.format('YYYY-MM-DD'), { shouldValidate: true });
      setValue('endTime', newStart.format('HH:mm'), { shouldValidate: true });
    }
  };

  const handleEndChange = (date: Date) => {
    setValue('endDate', dayjs.utc(date).format('YYYY-MM-DD'));
    setValue('endTime', dayjs.utc(date).format('HH:mm'));
    void trigger(['startDate', 'startTime', 'endDate', 'endTime']);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('overview.dateTitle')}</CardTitle>
        <CardDescription>{t('overview.dateSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1" data-field="startDate">
          <p className="text-sm font-medium text-foreground">{t('overview.eventStart')}</p>
          <DateInputFloat
            testId="event-start-date-button"
            overlay="dialog"
            value={startDateTime}
            onChangeAction={handleStartChange}
            dateLabel={t('overview.date')}
            timeLabel={t('overview.time')}
            allowPastDates={false}
            minDate={minDate}
            error={errors.startDate?.message ?? errors.startTime?.message}
            disabled={isDisableField}
          />
        </div>

        <div className="space-y-1" data-field="endDate">
          <p className="text-sm font-medium text-foreground">{t('overview.eventEnd')}</p>
          <DateInputFloat
            testId="event-end-date-button"
            overlay="dialog"
            value={endDateTime}
            onChangeAction={handleEndChange}
            dateLabel={t('overview.date')}
            timeLabel={t('overview.time')}
            allowPastDates={false}
            minDate={minDate}
            error={errors.endDate?.message ?? errors.endTime?.message}
            disabled={isDisableField}
          />
        </div>
      </CardContent>
    </Card>
  );
}
