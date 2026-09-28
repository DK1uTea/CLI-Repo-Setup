'use client'

import { useId } from 'react'
import { useFormContext, useFormState } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import type { ActivationStep2Data } from '../../../(helpers)/activation-step2-schema'

export function ActivationNameInput() {
  const t = useTranslations('activationForm')
  const { register, control } = useFormContext<ActivationStep2Data>()
  const { errors } = useFormState({ control })
  const inputId = useId()

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <Label htmlFor={inputId} className="text-sm font-semibold text-foreground">
        {t('step2.activationName')} <span className="text-destructive" aria-hidden="true">*</span>
      </Label>
      <Input
        id={inputId}
        {...register('name')}
        required
        placeholder={t('step2.activationNamePlaceholder')}
        translate="no"
        aria-invalid={!!errors.name}
        error={errors.name?.message}
        className='bg-input/50'
      />
    </div>
  )
}
