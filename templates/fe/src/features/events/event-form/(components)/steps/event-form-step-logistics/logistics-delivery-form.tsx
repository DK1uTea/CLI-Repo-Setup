'use client';

import { useState } from 'react';
import { useFormContext, useFormState, useWatch, Controller } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { InputFloat } from '@/shared/components/ui/input-float';
import { ComboboxFloat } from '@/shared/components/ui/combobox-float';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';
import { useEventLocation } from '@/features/events/event-form/(hooks)/use-event-location';

type DeliveryFieldErrors = {
  deliveryAddress?: { message?: string };
  deliveryStreet?: { message?: string };
  deliveryZipCode?: { message?: string };
  deliveryCity?: { message?: string };
};

type Props = { visible: boolean; index: number; disabled?: boolean };

export function LogisticsDeliveryForm({ visible, index, disabled }: Props) {
  const t = useTranslations('eventForm');
  const { register, setValue, control } = useFormContext<EventFormDto>();
  const { errors } = useFormState<EventFormDto>();
  const fieldErrors = (errors.deliveryLocations as DeliveryFieldErrors[] | undefined)?.[index];

  const [searchQuery, setSearchQuery] = useState('');
  const {
    locations,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useEventLocation({ search: searchQuery });

  const handleLocationChange = (val: string) => {
    const loc = locations.find((l) => l.id === val);
    if (loc) {
      setValue(`deliveryLocations.${index}.deliveryAddress`, loc.name, { shouldDirty: true, shouldValidate: true });
      setValue(`deliveryLocations.${index}.deliveryStreet`, loc.street, { shouldDirty: true, shouldValidate: true });
      setValue(`deliveryLocations.${index}.deliveryZipCode`, loc.postalCode, { shouldDirty: true, shouldValidate: true });
      setValue(`deliveryLocations.${index}.deliveryCity`, loc.city, { shouldDirty: true, shouldValidate: true });
    } else if (!val) {
      setValue(`deliveryLocations.${index}.deliveryAddress`, '', { shouldDirty: true, shouldValidate: true });
      setValue(`deliveryLocations.${index}.deliveryStreet`, '', { shouldDirty: true, shouldValidate: true });
      setValue(`deliveryLocations.${index}.deliveryZipCode`, '', { shouldDirty: true, shouldValidate: true });
      setValue(`deliveryLocations.${index}.deliveryCity`, '', { shouldDirty: true, shouldValidate: true });
    }
  };

  const addr = useWatch({ control, name: `deliveryLocations.${index}.deliveryAddress` });
  const street = useWatch({ control, name: `deliveryLocations.${index}.deliveryStreet` });
  const zip = useWatch({ control, name: `deliveryLocations.${index}.deliveryZipCode` });
  const city = useWatch({ control, name: `deliveryLocations.${index}.deliveryCity` });
  const saveAddr = useWatch({ control, name: `deliveryLocations.${index}.isGenerateAddress` });
  const locationId = useWatch({ control, name: `deliveryLocations.${index}.eventLocation` });

  const comboboxOptions = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }));

  if (locationId && addr && !comboboxOptions.some((opt) => opt.value === locationId)) {
    comboboxOptions.unshift({
      value: locationId,
      label: addr,
    });
  }

  return (
    <div className={cn('overflow-hidden transition-all duration-300', visible ? 'mt-4 max-h-125 opacity-100' : 'max-h-0 opacity-0')}>
      <div className="space-y-3">
        <Controller
          name={`deliveryLocations.${index}.eventLocation`}
          control={control}
          render={({ field }) => (
            <ComboboxFloat
              label={t('overview.selectLocation')}
              value={field.value ?? ''}
              onValueChange={(val) => {
                field.onChange(val);
                handleLocationChange(val);
              }}
              onSearchChange={setSearchQuery}
              onLoadMore={fetchNextPage}
              hasMore={hasNextPage}
              loadingMore={isFetchingNextPage}
              options={comboboxOptions}
              error={fieldErrors?.deliveryAddress?.message}
              disabled={disabled}
            />
          )}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputFloat
            label={t('overview.venueName')}
            value={addr ?? ''}
            error={fieldErrors?.deliveryAddress?.message}
            {...register(`deliveryLocations.${index}.deliveryAddress`, {
              onChange: () => {
                setValue(`deliveryLocations.${index}.eventLocation`, '', { shouldDirty: true });
              },
            })}
          />
          <InputFloat
            label={t('overview.street')}
            value={street ?? ''}
            error={fieldErrors?.deliveryStreet?.message}
            {...register(`deliveryLocations.${index}.deliveryStreet`, {
              onChange: () => {
                setValue(`deliveryLocations.${index}.eventLocation`, '', { shouldDirty: true });
              },
            })}
          />
          <InputFloat
            label={t('overview.postalCode')}
            value={zip ?? ''}
            error={fieldErrors?.deliveryZipCode?.message}
            {...register(`deliveryLocations.${index}.deliveryZipCode`, {
              onChange: () => {
                setValue(`deliveryLocations.${index}.eventLocation`, '', { shouldDirty: true });
              },
            })}
          />
          <InputFloat
            label={t('overview.city')}
            value={city ?? ''}
            error={fieldErrors?.deliveryCity?.message}
            {...register(`deliveryLocations.${index}.deliveryCity`, {
              onChange: () => {
                setValue(`deliveryLocations.${index}.eventLocation`, '', { shouldDirty: true });
              },
            })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`saveAddr-${index}`}
            checked={saveAddr ?? false}
            onCheckedChange={(v) => setValue(`deliveryLocations.${index}.isGenerateAddress`, !!v, { shouldDirty: true })}
            disabled={disabled}
          />
          <Label htmlFor={`saveAddr-${index}`} className="cursor-pointer text-sm">{t('overview.saveAddress')}</Label>
        </div>
      </div>
    </div>
  );
}
