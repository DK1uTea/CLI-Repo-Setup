'use client'

import { useFormContext, useFormState, useWatch, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getBrandFitOptions } from '../../../(helpers)/activation-form-options'
import type { ActivationStep2Data } from '../../../(helpers)/activation-step2-schema'

const MAX_NOTES = 150
const BRAND_FIT_OPTIONS = getBrandFitOptions()

export function BrandFitInput() {
  const t = useTranslations('activationForm')
  const { control } = useFormContext<ActivationStep2Data>()
  const { errors } = useFormState({ control })
  const notesValue = useWatch({ control, name: 'brandFitNotes' }) ?? ''

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <p className="font-semibold text-foreground">
          {t('step2.brandFitTitle')}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{t('step2.brandFitSubtitle')}</p>
      </div>

      <Controller
        control={control}
        name="brandFit"
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            aria-required="true"
            aria-invalid={!!errors.brandFit}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {BRAND_FIT_OPTIONS.map((opt) => {
              const isSelected = field.value === opt.value
              return (
                <label
                  key={opt.value}
                  htmlFor={`bf-${opt.value}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                    isSelected
                      ? 'border-primary'
                      : 'border-border bg-input/40 hover:bg-muted/40',
                  )}
                >
                  <RadioGroupItem id={`bf-${opt.value}`} value={opt.value} className='border-2 border-gray-400' />
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              )
            })}
          </RadioGroup>
        )}
      />
      {errors.brandFit && (
        <p className="text-xs text-destructive">{errors.brandFit.message}</p>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">{t('step2.brandFitNotes')}</p>
        <Controller
          control={control}
          name="brandFitNotes"
          render={({ field }) => (
            <div className="relative">
              <Textarea
                {...field}
                placeholder={t('step2.brandFitNotesPlaceholder')}
                maxLength={MAX_NOTES}
                rows={3}
                translate="no"
                aria-invalid={!!errors.brandFitNotes}
                className='bg-input/40'
              />
              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                {notesValue.length}/{MAX_NOTES}
              </span>
            </div>
          )}
        />
        {errors.brandFitNotes && (
          <p className="text-xs text-destructive">{errors.brandFitNotes.message}</p>
        )}
      </div>
    </div>
  )
}
