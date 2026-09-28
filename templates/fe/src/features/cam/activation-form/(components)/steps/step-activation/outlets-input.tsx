'use client'

import { useFormContext, useFormState, useWatch, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ActivationStep2Data } from '../../../(helpers)/activation-step2-schema'

const MAX_NOTES = 150

export function OutletsInput() {
  const t = useTranslations('activationForm')
  const { control } = useFormContext<ActivationStep2Data>()
  const { errors } = useFormState({ control })
  const notesValue = useWatch({ control, name: 'outletNotes' }) ?? ''

  const outletOptions = [
    { value: 1, label: t('step2.oneOutlet') },
    { value: 2, label: t('step2.twoOutlets') },
    { value: 3, label: t('step2.threeOutlets') },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <p className="font-semibold text-foreground">
          {t('step2.outletsTitle')} <span className="text-destructive">*</span>
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{t('step2.outletsSubtitle')}</p>
      </div>

      <Controller
        control={control}
        name="numberOfOutlets"
        render={({ field }) => (
          <RadioGroup
            value={field.value != null ? String(field.value) : ''}
            onValueChange={(v) => field.onChange(Number(v))}
            aria-required="true"
            aria-invalid={!!errors.numberOfOutlets}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {outletOptions.map((opt) => {
              const isSelected = field.value === opt.value
              return (
                <label
                  key={opt.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                    isSelected
                      ? 'border-primary'
                      : 'border-border bg-input/40 hover:bg-muted/40',
                  )}
                >
                  <RadioGroupItem value={String(opt.value)} className='border-2 border-gray-400' />
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              )
            })}
          </RadioGroup>
        )}
      />
      {errors.numberOfOutlets && (
        <p className="text-xs text-destructive">{errors.numberOfOutlets.message}</p>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">{t('step2.outletNotes')}</p>
        <Controller
          control={control}
          name="outletNotes"
          render={({ field }) => (
            <div className="relative">
              <Textarea
                {...field}
                placeholder={t('step2.outletNotesPlaceholder')}
                maxLength={MAX_NOTES}
                rows={3}
                translate="no"
                aria-invalid={!!errors.outletNotes}
                className='bg-input/40'
              />
              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                {notesValue.length}/{MAX_NOTES}
              </span>
            </div>
          )}
        />
        {errors.outletNotes && (
          <p className="text-xs text-destructive">{errors.outletNotes.message}</p>
        )}
      </div>
    </div>
  )
}
