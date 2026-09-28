'use client';

import { useEffect } from 'react';
import { useFormContext, useFormState, useWatch, Controller, useFieldArray } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { dayjs, nowUtc } from '@/lib/date-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { InputFloat } from '@/shared/components/ui/input-float';
import { SelectFloat } from '@/shared/components/ui/select-float';
import { SelectItem } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { IconLocation } from '@/shared/components/common/icons';
import { DateInputFloat } from '@/shared/components/ui/date-input-float';
import { LogisticsDeliveryForm } from './logistics-delivery-form';
import { useQueryState, parseAsString } from 'nuqs';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';
import { isOverlapping } from '../../../(helpers)/event-form-helpers';
import { useLogisticsFilterConfig } from '../../../(hooks)/use-logistics-filter-config';

const toDate = (date?: string, time?: string) =>
  date ? dayjs.utc(`${date}T${time || '00:00'}`).toDate() : nowUtc();

const toRangeDate = (date?: string, time?: string) => {
  if (!date) return null;
  const value = dayjs.utc(`${date}T${time || '00:00'}`);
  return value.isValid() ? value.toDate() : null;
};

const SETUP_FIELDS: ('setupStartDate' | 'setupStartTime' | 'setupEndDate' | 'setupEndTime')[] = [
  'setupStartDate', 'setupStartTime', 'setupEndDate', 'setupEndTime',
];
const TEARDOWN_FIELDS: ('teardownStartDate' | 'teardownStartTime' | 'teardownEndDate' | 'teardownEndTime')[] = [
  'teardownStartDate', 'teardownStartTime', 'teardownEndDate', 'teardownEndTime',
];

export function LogisticsContactCard() {
  const t = useTranslations('eventForm');
  const { register, setValue, control, trigger } = useFormContext<EventFormDto>();
  const { errors } = useFormState<EventFormDto>();
  const { fields, append, remove } = useFieldArray({ control, name: 'deliveryLocations' });
  const isDifferent = useWatch({ control, name: 'isDifferentDeliveryAddress' }) ?? false;

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const canEdit = useEventDetailStore((s) => s.canEdit);
  const isDisableField = eventIdParam ? !canEdit : false;
  const today = dayjs.utc(nowUtc()).startOf('day').toDate();

  const { data: filterConfig, isLoading: isFilterConfigLoading } = useLogisticsFilterConfig();
  const warehousesOptions = filterConfig?.warehouses?.map((w) => ({
    value: w.code,
    label: w.name,
  })) ?? [];

  const wareHouseCode = useWatch({ control, name: 'wareHouseCode' });

  useEffect(() => {
    if (!wareHouseCode && warehousesOptions.length > 0) {
      setValue('wareHouseCode', warehousesOptions[0].value, { shouldValidate: true, shouldDirty: true });
    }
  }, [wareHouseCode, warehousesOptions, setValue]);

  const setupStartDate = useWatch({ control, name: 'setupStartDate' });
  const setupStartTime = useWatch({ control, name: 'setupStartTime' });
  const setupEndDate = useWatch({ control, name: 'setupEndDate' });
  const setupEndTime = useWatch({ control, name: 'setupEndTime' });
  const teardownStartDate = useWatch({ control, name: 'teardownStartDate' });
  const teardownStartTime = useWatch({ control, name: 'teardownStartTime' });
  const teardownEndDate = useWatch({ control, name: 'teardownEndDate' });
  const teardownEndTime = useWatch({ control, name: 'teardownEndTime' });
  const eventStartDate = useWatch({ control, name: 'startDate' });
  const eventStartTime = useWatch({ control, name: 'startTime' });
  const eventEndDate = useWatch({ control, name: 'endDate' });
  const eventEndTime = useWatch({ control, name: 'endTime' });

  const eventStart = toRangeDate(eventStartDate, eventStartTime);
  const eventEnd = toRangeDate(eventEndDate, eventEndTime);
  const setupStart = toRangeDate(setupStartDate, setupStartTime);
  const setupEnd = toRangeDate(setupEndDate, setupEndTime);
  const teardownStart = toRangeDate(teardownStartDate, teardownStartTime);
  const teardownEnd = toRangeDate(teardownEndDate, teardownEndTime);
  const setupOverlapsEvent = Boolean(
    eventStart && eventEnd && setupStart && setupEnd && isOverlapping(setupStart, setupEnd, eventStart, eventEnd),
  );
  const teardownOverlapsEvent = Boolean(
    eventStart && eventEnd && teardownStart && teardownEnd && isOverlapping(teardownStart, teardownEnd, eventStart, eventEnd),
  );

  useEffect(() => {
    if (!setupStartDate || !setupEndDate) return;
    const start = dayjs.utc(`${setupStartDate}T${setupStartTime || '00:00'}`);
    const end = dayjs.utc(`${setupEndDate}T${setupEndTime || '00:00'}`);
    if (end.valueOf() <= start.valueOf()) {
      setValue('setupEndDate', start.add(1, 'day').format('YYYY-MM-DD'), { shouldDirty: true });
      setValue('setupEndTime', start.format('HH:mm'), { shouldDirty: true });
      trigger(SETUP_FIELDS).catch(() => {});
    }
  }, [setupStartDate, setupStartTime, setValue, trigger]);

  useEffect(() => {
    trigger(SETUP_FIELDS).catch(() => {});
  }, [setupStartDate, setupStartTime, setupEndDate, setupEndTime, trigger]);

  useEffect(() => {
    if (!teardownStartDate) return;
    if (!teardownEndDate) {
      setValue('teardownEndDate', teardownStartDate, { shouldDirty: true });
      setValue('teardownEndTime', teardownStartTime || '00:00', { shouldDirty: true });
      trigger(TEARDOWN_FIELDS).catch(() => {});
      return;
    }
    const start = dayjs.utc(`${teardownStartDate}T${teardownStartTime || '00:00'}`);
    const end = dayjs.utc(`${teardownEndDate}T${teardownEndTime || '00:00'}`);
    if (end.valueOf() <= start.valueOf()) {
      setValue('teardownEndDate', start.add(1, 'day').format('YYYY-MM-DD'), { shouldDirty: true });
      setValue('teardownEndTime', start.format('HH:mm'), { shouldDirty: true });
      trigger(TEARDOWN_FIELDS).catch(() => {});
    }
  }, [teardownStartDate, teardownStartTime, setValue, trigger]);

  useEffect(() => {
    trigger(TEARDOWN_FIELDS).catch(() => {});
  }, [teardownStartDate, teardownStartTime, teardownEndDate, teardownEndTime, trigger]);

  const handleDateChange = (dateField: keyof EventFormDto, timeField: keyof EventFormDto) => (date: Date) => {
    setValue(dateField, dayjs.utc(date).format('YYYY-MM-DD'), { shouldDirty: true });
    setValue(timeField, dayjs.utc(date).format('HH:mm'), { shouldDirty: true });
    trigger(dateField.toString().startsWith('setup') ? SETUP_FIELDS : TEARDOWN_FIELDS).catch(() => {});
  };

  const handleEndDateChange = (
    dateField: 'setupEndDate' | 'teardownEndDate',
    timeField: 'setupEndTime' | 'teardownEndTime',
    rangeFields: ('setupStartDate' | 'setupStartTime' | 'setupEndDate' | 'setupEndTime' | 'teardownStartDate' | 'teardownStartTime' | 'teardownEndDate' | 'teardownEndTime')[],
  ) => (date: Date) => {
    setValue(dateField, dayjs.utc(date).format('YYYY-MM-DD'), { shouldDirty: true });
    setValue(timeField, dayjs.utc(date).format('HH:mm'), { shouldDirty: true });
    trigger(rangeFields).catch(() => {});
  };

  const handleDifferentAddress = (checked: boolean) => {
    setValue('isDifferentDeliveryAddress', checked, { shouldDirty: true });
    if (checked) append({ eventLocation: '', deliveryAddress: '', deliveryStreet: '', deliveryZipCode: '', deliveryCity: '', isGenerateAddress: false });
    else remove();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('logistics.contactTitle')}</CardTitle>
        <CardDescription>{t('logistics.contactSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div data-field="wareHouseCode" data-testid="logistics-warehouse-select">
          <Controller name="wareHouseCode" control={control} render={({ field }) => (
            <SelectFloat
              label={t('logistics.warehouse')}
              value={field.value ?? ''}
              onValueChange={field.onChange}
              error={errors.wareHouseCode?.message}
              disabled={isDisableField || isFilterConfigLoading}
            >
              {warehousesOptions.map((o) => <SelectItem key={o.value} value={o.value} data-testid={`logistics-warehouse-option-${o.value}`}>{o.label}</SelectItem>)}
            </SelectFloat>
          )} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InputFloat
            data-testid="logistics-contact-name-input"
            label={t('logistics.contactName')}
            value={useWatch({ control, name: 'logisticsContactName' }) ?? ''}
            error={errors.logisticsContactName?.message}
            {...register('logisticsContactName')}
          />
          <InputFloat
            data-testid="logistics-contact-email-input"
            label={t('logistics.contactEmail')}
            type="email"
            value={useWatch({ control, name: 'logisticsContactEmail' }) ?? ''}
            error={errors.logisticsContactEmail?.message}
            {...register('logisticsContactEmail')}
          />
          <InputFloat
            data-testid="logistics-contact-phone-input"
            label={t('logistics.contactPhone')}
            type="tel"
            value={useWatch({ control, name: 'logisticsContactPhone' }) ?? ''}
            error={errors.logisticsContactPhone?.message}
            {...register('logisticsContactPhone')}
          />
        </div>

        <Separator className="my-9" />
        <div data-field="deliveryLocations" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-1 h-11">
          <Checkbox id="isDifferentDeliveryAddress" checked={isDifferent} onCheckedChange={(v) => handleDifferentAddress(!!v)} disabled={isDisableField} />
          <Label htmlFor="isDifferentDeliveryAddress" className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium">
            {t('logistics.differentDeliveryAddress')}
            <IconLocation className="size-5" />
          </Label>
        </div>
        {fields.map((_, i) => <LogisticsDeliveryForm key={i} visible={isDifferent} index={i} disabled={isDisableField} />)}

        <Separator className="my-9" />
        <div className="space-y-4">
          <div className="space-y-1" data-field="setupStartDate">
            <p className="text-sm font-medium">{t('logistics.setupStart')}</p>
            <DateInputFloat
              testId="logistics-setup-start-date-button"
              overlay="dialog"
              value={toDate(setupStartDate, setupStartTime)}
              onChangeAction={handleDateChange('setupStartDate', 'setupStartTime')}
              dateLabel={t('overview.date')}
              timeLabel={t('overview.time')}
              minDate={today}
              error={errors.setupStartDate?.message ?? errors.setupStartTime?.message}
              disabled={isDisableField}
            />
          </div>
          <div className="space-y-1" data-field="setupEndDate">
            <p className="text-sm font-medium">{t('logistics.setupEnd')}</p>
            <DateInputFloat
              testId="logistics-setup-end-date-button"
              overlay="dialog"
              value={toDate(setupEndDate, setupEndTime)}
              onChangeAction={handleEndDateChange('setupEndDate', 'setupEndTime', [
                'setupStartDate', 'setupStartTime', 'setupEndDate', 'setupEndTime',
              ])}
              dateLabel={t('overview.date')}
              timeLabel={t('overview.time')}
              minDate={today}
              warning={setupOverlapsEvent ? t('logistics.setupOverlapsEvent') : undefined}
              error={errors.setupEndDate?.message ?? errors.setupEndTime?.message}
              disabled={isDisableField}
            />
          </div>
          <Separator className="my-9" />
          <div className="space-y-1" data-field="teardownStartDate">
            <p className="text-sm font-medium">{t('logistics.teardownStart')}</p>
            <DateInputFloat
              testId="logistics-teardown-start-date-button"
              overlay="dialog"
              value={toDate(teardownStartDate, teardownStartTime)}
              onChangeAction={handleDateChange('teardownStartDate', 'teardownStartTime')}
              dateLabel={t('overview.date')}
              timeLabel={t('overview.time')}
              minDate={today}
              error={errors.teardownStartDate?.message ?? errors.teardownStartTime?.message}
              disabled={isDisableField}
            />
          </div>
          <div className="space-y-1" data-field="teardownEndDate">
            <p className="text-sm font-medium">{t('logistics.teardownEnd')}</p>
            <DateInputFloat
              testId="logistics-teardown-end-date-button"
              overlay="dialog"
              value={toDate(teardownEndDate, teardownEndTime)}
              onChangeAction={handleEndDateChange('teardownEndDate', 'teardownEndTime', [
                'teardownStartDate', 'teardownStartTime', 'teardownEndDate', 'teardownEndTime',
              ])}
              dateLabel={t('overview.date')}
              timeLabel={t('overview.time')}
              minDate={today}
              warning={teardownOverlapsEvent ? t('logistics.teardownOverlapsEvent') : undefined}
              error={errors.teardownEndDate?.message ?? errors.teardownEndTime?.message}
              disabled={isDisableField}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
