'use client'

import { useFormContext, useFormState, useWatch, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getHighTrafficZones } from '../../../(helpers)/activation-form-options'
import type { ActivationStep2Data } from '../../../(helpers)/activation-step2-schema'

const MAX_NOTES = 150
const HTZ_OPTIONS = getHighTrafficZones()

export function HtzInput() {
  const t = useTranslations('activationForm')
  const { control } = useFormContext<ActivationStep2Data>()
  const { errors } = useFormState({ control })
  const notesValue = useWatch({ control, name: 'highTrafficZoneNotes' }) ?? ''

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <p className="font-semibold text-foreground">
          {t('step2.htzTitle')} <span className="text-destructive">*</span>
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{t('step2.htzSubtitle')}</p>
      </div>

      <Controller
        control={control}
        name="highTrafficZones"
        render={({ field }) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            aria-invalid={!!errors.highTrafficZones}
          >
            {HTZ_OPTIONS.map((opt) => {
              const isChecked = field.value.includes(opt.value)
              const id = `htz-${opt.value}`
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
                    {t(`step2.htzOptions.${opt.value}` as any)}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      />
      {errors.highTrafficZones && (
        <p className="text-xs text-destructive">{errors.highTrafficZones.message}</p>
      )}

      <div className="space-y-1.5">
        <Controller
          control={control}
          name="highTrafficZoneNotes"
          render={({ field }) => (
            <div className="relative">
              <Textarea
                {...field}
                aria-label={t('step2.htzNotesPlaceholder')}
                placeholder={t('step2.htzNotesPlaceholder')}
                maxLength={MAX_NOTES}
                rows={3}
                translate="no"
                aria-invalid={!!errors.highTrafficZoneNotes}
                className="bg-input/40"
              />
              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                {notesValue.length}/{MAX_NOTES}
              </span>
            </div>
          )}
        />
        {errors.highTrafficZoneNotes && (
          <p className="text-xs text-destructive">{errors.highTrafficZoneNotes.message}</p>
        )}
      </div>
    </div>
  )
}
