'use client';

import { useState } from 'react';
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ComboboxFloat } from '@/shared/components/ui/combobox-float';
import { InputFloat } from '@/shared/components/ui/input-float';
import { Label } from '@/shared/components/ui/label';
import type { TradeFairEventFormDto } from '../../../(helpers)/trade-fair-event-form-schema';
import { useTradeFairLocation } from '../../../(hooks)/use-trade-fair-location';

export function LocationCard() {
  const t = useTranslations('reportingTool.tradeFairEventForm.generalInfo');
  const { register, setValue, control } = useFormContext<TradeFairEventFormDto>();
  const { errors } = useFormState<TradeFairEventFormDto>();

  const [searchQuery, setSearchQuery] = useState('');
  const {
    locations,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useTradeFairLocation({ search: searchQuery });

  const address = useWatch({ control, name: 'address' });
  const street = useWatch({ control, name: 'street' });
  const zipCode = useWatch({ control, name: 'zipCode' });
  const city = useWatch({ control, name: 'city' });
  const locationId = useWatch({ control, name: 'locationId' });
  const isSaveLocation = useWatch({ control, name: 'isSaveLocation' });

  const handleLocationChange = (value: string) => {
    const location = locations.find((item) => item.id === value);
    if (location) {
      setValue('locationId', location.id, { shouldDirty: true });
      setValue('address', location.locationName, { shouldDirty: true, shouldValidate: true });
      setValue('street', location.street, { shouldDirty: true, shouldValidate: true });
      setValue('zipCode', location.postcode, { shouldDirty: true, shouldValidate: true });
      setValue('city', location.city, { shouldDirty: true, shouldValidate: true });
    } else if (!value) {
      setValue('locationId', '', { shouldDirty: true });
      setValue('address', '', { shouldDirty: true, shouldValidate: true });
      setValue('street', '', { shouldDirty: true, shouldValidate: true });
      setValue('zipCode', '', { shouldDirty: true, shouldValidate: true });
      setValue('city', '', { shouldDirty: true, shouldValidate: true });
    }
  };

  const comboboxOptions = locations.map((location) => ({
    value: location.id,
    label: location.locationName,
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
        <CardTitle>
          {t('locationTitle')}
          <span className="text-red-500"> *</span>
        </CardTitle>
        <CardDescription>{t('locationSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div data-field="eventLocation">
          <Controller
            name="eventLocation"
            control={control}
            render={({ field }) => (
              <ComboboxFloat
                label={t('selectLocation')}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  handleLocationChange(value);
                }}
                onSearchChange={setSearchQuery}
                onLoadMore={fetchNextPage}
                hasMore={hasNextPage}
                loadingMore={isFetchingNextPage}
                options={comboboxOptions}
                error={errors.eventLocation?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputFloat
            label={t('venueName')}
            value={address ?? ''}
            error={errors.address?.message}
            {...register('address', {
              onChange: () => {
                setValue('locationId', '', { shouldDirty: true });
                setValue('eventLocation', '', { shouldDirty: true });
              },
            })}
          />
          <InputFloat
            label={t('street')}
            value={street ?? ''}
            error={errors.street?.message}
            {...register('street', {
              onChange: () => {
                setValue('locationId', '', { shouldDirty: true });
                setValue('eventLocation', '', { shouldDirty: true });
              },
            })}
          />
          <InputFloat
            label={t('postalCode')}
            value={zipCode ?? ''}
            error={errors.zipCode?.message}
            {...register('zipCode', {
              onChange: () => {
                setValue('locationId', '', { shouldDirty: true });
                setValue('eventLocation', '', { shouldDirty: true });
              },
            })}
          />
          <InputFloat
            label={t('city')}
            value={city ?? ''}
            error={errors.city?.message}
            {...register('city', {
              onChange: () => {
                setValue('locationId', '', { shouldDirty: true });
                setValue('eventLocation', '', { shouldDirty: true });
              },
            })}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="tradeFairIsSaveLocation"
            checked={isSaveLocation ?? false}
            onCheckedChange={(checked) => {
              setValue('isSaveLocation', !!checked, { shouldDirty: true });
            }}
          />
          <Label htmlFor="tradeFairIsSaveLocation" className="cursor-pointer text-sm">
            {t('saveAddress')}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
