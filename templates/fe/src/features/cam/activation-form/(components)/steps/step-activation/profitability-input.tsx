'use client'

import { useFormContext, useFormState, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { getProfitabilityOptions } from '../../../(helpers)/activation-form-options'
import type { ActivationStep2Data } from '../../../(helpers)/activation-step2-schema'

const PROFITABILITY_OPTIONS = getProfitabilityOptions()

export function ProfitabilityInput() {
  const t = useTranslations('activationForm')
  const { control } = useFormContext<ActivationStep2Data>()
  const { errors } = useFormState({ control })

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <p className="font-semibold text-foreground">
          {t('step2.profitabilityTitle')}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{t('step2.profitabilitySubtitle')}</p>
      </div>

      <Controller
        control={control}
        name="profitability"
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            aria-required="true"
            aria-invalid={!!errors.profitability}
            className="flex flex-col gap-3"
          >
            {PROFITABILITY_OPTIONS.map((opt) => {
              const isSelected = field.value === opt.value
              return (
                <label
                  key={opt.value}
                  htmlFor={`pf-${opt.value}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                    isSelected
                      ? 'border-primary'
                      : 'border-border bg-input/40 hover:bg-muted/40',
                  )}
                >
                  <RadioGroupItem id={`pf-${opt.value}`} value={opt.value} className='border-2 border-gray-400' />
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              )
            })}
          </RadioGroup>
        )}
      />
      {errors.profitability && (
        <p className="text-xs text-destructive">{errors.profitability.message}</p>
      )}
    </div>
  )
}
