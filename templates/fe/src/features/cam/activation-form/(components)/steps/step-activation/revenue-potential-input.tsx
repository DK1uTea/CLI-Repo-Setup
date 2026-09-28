'use client'

import { useFormContext, useFormState, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { getRevenuePotentials } from '../../../(helpers)/activation-form-options'
import type { ActivationStep2Data } from '../../../(helpers)/activation-step2-schema'

const REVENUE_POTENTIAL_OPTIONS = getRevenuePotentials()

export function RevenuePotentialInput() {
  const t = useTranslations('activationForm')
  const { control } = useFormContext<ActivationStep2Data>()
  const { errors } = useFormState({ control })

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <p className="font-semibold text-foreground">
          {t('step2.revenuePotentialTitle')}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{t('step2.revenuePotentialSubtitle')}</p>
      </div>

      <Controller
        control={control}
        name="revenuePotentials"
        render={({ field }) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            aria-invalid={!!errors.revenuePotentials}
          >
            {REVENUE_POTENTIAL_OPTIONS.map((opt) => {
              const isChecked = field.value.includes(opt.value)
              const id = `rp-${opt.value}`
              return (
                <label
                  key={opt.value}
                  htmlFor={id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                    isChecked
                      ? 'border-primary'
                      : 'border-border bg-input/40 hover:bg-muted/40',
                  )}
                >
                  <Checkbox
                    id={id}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...field.value, opt.value])
                      } else {
                        field.onChange(field.value.filter((v: string) => v !== opt.value))
                      }
                    }}
                  />
                  <span className="text-sm text-foreground">
                    {t(`step2.revenuePotentialOptions.${opt.value}` as any)}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      />
      {errors.revenuePotentials && (
        <p className="text-xs text-destructive">{errors.revenuePotentials.message}</p>
      )}
    </div>
  )
}
