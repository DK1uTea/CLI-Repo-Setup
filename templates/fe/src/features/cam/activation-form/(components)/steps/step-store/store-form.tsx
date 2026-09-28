'use client'

import { Controller, useFormState, type UseFormSetError } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { useStoreForm } from '../../../(hooks)/use-store-form'
import type { StoreFormData } from '../../../(helpers)/activation-schema'

type Props = {
  formId: string
  defaultValues?: Partial<StoreFormData>
  onSubmit: (data: StoreFormData, setError: UseFormSetError<StoreFormData>) => void
}

export function StoreForm({ formId, defaultValues, onSubmit }: Props) {
  const t = useTranslations('activationForm.store')
  const { control, handleSubmit, setError } = useStoreForm({ defaultValues })
  const { errors } = useFormState({ control })

  return (
    <form
      id={formId}
      noValidate
      onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      className="flex flex-col gap-5 p-6"
    >
      <div className="space-y-2">
        <Label htmlFor="store-name" className="text-xs">
          {t('fieldStoreName')} <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="storeName"
          render={({ field }) => (
            <Input
              id="store-name"
              required
              translate="no"
              placeholder={t('fieldStoreNamePlaceholder')}
              aria-invalid={!!errors.storeName}
              error={errors.storeName?.message}
              {...field}
              value={field.value ?? ''}
              className='bg-input/50'
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="store-address" className="text-xs">
          {t('fieldAddress')} <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="storeAddress"
          render={({ field }) => (
            <Input
              id="store-address"
              required
              translate="no"
              placeholder={t('fieldAddressPlaceholder')}
              aria-invalid={!!errors.storeAddress}
              error={errors.storeAddress?.message}
              {...field}
              value={field.value ?? ''}
              className='bg-input/50'
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="store-contact-name" className="text-xs">
          {t('fieldContactName')} <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="contactName"
          render={({ field }) => (
            <Input
              id="store-contact-name"
              required
              translate="no"
              placeholder={t('fieldContactNamePlaceholder')}
              aria-invalid={!!errors.contactName}
              error={errors.contactName?.message}
              {...field}
              value={field.value ?? ''}
              className='bg-input/50'
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="store-phone" className="text-xs">
          {t('fieldPhone')} <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="contactPhone"
          render={({ field }) => (
            <Input
              id="store-phone"
              required
              translate="no"
              placeholder={t('fieldPhonePlaceholder')}
              aria-invalid={!!errors.contactPhone}
              error={errors.contactPhone?.message}
              {...field}
              value={field.value ?? ''}
              className='bg-input/50'
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="store-email" className="text-xs">
          {t('fieldEmail')} <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="contactEmail"
          render={({ field }) => (
            <Input
              id="store-email"
              type="email"
              required
              translate="no"
              placeholder={t('fieldEmailPlaceholder')}
              aria-invalid={!!errors.contactEmail}
              error={errors.contactEmail?.message}
              {...field}
              value={field.value ?? ''}
              className='bg-input/50'
            />
          )}
        />
      </div>
    </form>
  )
}
