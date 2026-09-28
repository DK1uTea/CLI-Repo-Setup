'use client';

import { useState } from 'react';
import { useFormContext, useFormState, Controller, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useQueryState, parseAsString } from 'nuqs';
import { MapPinOffIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { InputFloat } from '@/shared/components/ui/input-float';
import { ComboboxFloat } from '@/shared/components/ui/combobox-float';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty';
import { Label } from '@/shared/components/ui/label';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';
import { useEventLocation } from '../../../(hooks)/use-event-location';

export function LocationCard() {
  const t = useTranslations('eventForm');
  const { register, setValue, control } = useFormContext<EventFormDto>();
  const { errors } = useFormState<EventFormDto>();

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const canEdit = useEventDetailStore((s) => s.canEdit);
  const isOverviewLocked = useEventDetailStore((s) => s.isOverviewLocked);
  const isDisableField = (eventIdParam ? !canEdit : false) || isOverviewLocked;

  const [searchQuery, setSearchQuery] = useState('');
  const {
    locations,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useEventLocation({ search: searchQuery });

  const address = useWatch({ control, name: 'address' });
  const street = useWatch({ control, name: 'street' });
  const zipCode = useWatch({ control, name: 'zipCode' });
  const city = useWatch({ control, name: 'city' });
  const isSaveAddress = useWatch({ control, name: 'isSaveAddress' });
  const locationId = useWatch({ control, name: 'locationId' });

  const handleLocationChange = (value: string) => {
    const location = locations.find((item) => item.id === value);
    if (location) {
      setValue('address', location.name, { shouldDirty: true, shouldValidate: true });
      setValue('street', location.street, { shouldDirty: true, shouldValidate: true });
      setValue('zipCode', location.postalCode, { shouldDirty: true, shouldValidate: true });
      setValue('city', location.city, { shouldDirty: true, shouldValidate: true });
    } else if (!value) {
      setValue('address', '', { shouldDirty: true, shouldValidate: true });
      setValue('street', '', { shouldDirty: true, shouldValidate: true });
      setValue('zipCode', '', { shouldDirty: true, shouldValidate: true });
      setValue('city', '', { shouldDirty: true, shouldValidate: true });
    }
  };

  const comboboxOptions = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }));

  if (locationId && address && !comboboxOptions.some((opt) => opt.value === locationId)) {
    comboboxOptions.unshift({
      value: locationId,
      label: address,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('overview.locationTitle')}</CardTitle>
        <CardDescription>{t('overview.locationSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div data-field="locationId">
          <Controller
            name="locationId"
            control={control}
            render={({ field }) => (
              <ComboboxFloat
                label={t('overview.selectLocation')}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  handleLocationChange(val);
                }}
                onSearchChange={setSearchQuery}
                onLoadMore={fetchNextPage}
                hasMore={hasNextPage}
                loadingMore={isFetchingNextPage}
                options={comboboxOptions}
                emptyContent={
                  <Empty className="gap-2 px-4 py-6">
                    <EmptyMedia>
                      <MapPinOffIcon className="size-8 text-primary" />
                    </EmptyMedia>
                    <EmptyHeader>
                      <EmptyTitle>{t('overview.noLocations')}</EmptyTitle>
                      <EmptyDescription>{t('overview.noLocationsDescription')}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                }
                error={errors.locationId?.message}
                disabled={isDisableField}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputFloat
            data-testid="event-venue-name-input"
            label={t('overview.venueName')}
            value={address ?? ''}
            error={errors.address?.message}
            disabled={isDisableField}
            {...register('address', {
              onChange: () => {
                setValue('locationId', '', { shouldDirty: true });
              },
            })}
          />
          <InputFloat
            data-testid="event-street-input"
            label={t('overview.street')}
            value={street ?? ''}
            error={errors.street?.message}
            disabled={isDisableField}
            {...register('street', {
              onChange: () => {
                setValue('locationId', '', { shouldDirty: true });
              },
            })}
          />
          <InputFloat
            data-testid="event-postal-code-input"
            label={t('overview.postalCode')}
            value={zipCode ?? ''}
            error={errors.zipCode?.message}
            disabled={isDisableField}
            {...register('zipCode', {
              onChange: () => {
                setValue('locationId', '', { shouldDirty: true });
              },
            })}
          />
          <InputFloat
            data-testid="event-city-input"
            label={t('overview.city')}
            value={city ?? ''}
            error={errors.city?.message}
            disabled={isDisableField}
            {...register('city', {
              onChange: () => {
                setValue('locationId', '', { shouldDirty: true });
              },
            })}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="isSaveAddress"
            checked={isSaveAddress ?? false}
            onCheckedChange={(checked) => setValue('isSaveAddress', !!checked, { shouldDirty: true })}
            disabled={isDisableField}
          />
          <Label htmlFor="isSaveAddress" className="cursor-pointer text-sm">
            {t('overview.saveAddress')}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
