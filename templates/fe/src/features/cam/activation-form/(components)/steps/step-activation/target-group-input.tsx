'use client'

import { useFormContext, useFormState, useWatch, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getTargetGroups } from '../../../(helpers)/activation-form-options'
import type { ActivationStep2Data } from '../../../(helpers)/activation-step2-schema'

const MAX_NOTES = 150
const TARGET_GROUP_OPTIONS = getTargetGroups()

export function TargetGroupInput() {
  const t = useTranslations('activationForm')
  const { control } = useFormContext<ActivationStep2Data>()
  const { errors } = useFormState({ control })
  const notesValue = useWatch({ control, name: 'targetGroupNotes' }) ?? ''

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <p className="font-semibold text-foreground">
          {t('step2.targetGroupTitle')}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{t('step2.targetGroupSubtitle')}</p>
      </div>

      <Controller
        control={control}
        name="targetGroups"
        render={({ field }) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            aria-invalid={!!errors.targetGroups}
          >
            {TARGET_GROUP_OPTIONS.map((opt) => {
              const isChecked = field.value.includes(opt.value)
              const id = `tg-${opt.value}`
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
                    {t(`step2.targetGroupOptions.${opt.value}` as any)}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      />
      {errors.targetGroups && (
        <p className="text-xs text-destructive">{errors.targetGroups.message}</p>
      )}

      <div className="space-y-1.5">
        <Controller
          control={control}
          name="targetGroupNotes"
          render={({ field }) => (
            <div className="relative">
              <Textarea
                {...field}
                aria-label={t('step2.targetGroupNotesPlaceholder')}
                placeholder={t('step2.targetGroupNotesPlaceholder')}
                maxLength={MAX_NOTES}
                rows={3}
                translate="no"
                aria-invalid={!!errors.targetGroupNotes}
                className="bg-input/40"
              />
              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                {notesValue.length}/{MAX_NOTES}
              </span>
            </div>
          )}
        />
        {errors.targetGroupNotes && (
          <p className="text-xs text-destructive">{errors.targetGroupNotes.message}</p>
        )}
      </div>
    </div>
  )
}
