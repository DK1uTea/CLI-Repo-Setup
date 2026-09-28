'use client'

import { useFormContext, useFormState, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { getHMarktLocations } from '../../../(helpers)/activation-form-options'
import type { ActivationStep2Data } from '../../../(helpers)/activation-step2-schema'
import type { ImageFile } from '@/shared/components/ui/upload-dropzone'
import { ActivationMediaUpload } from './activation-media-upload'

const H_MARKT_OPTIONS = getHMarktLocations()

export function HMarktInput() {
  const t = useTranslations('activationForm')
  const { control } = useFormContext<ActivationStep2Data>()
  const { errors } = useFormState({ control })

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <p className="font-semibold text-foreground">
          {t('step2.hMarktTitle')}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{t('step2.hMarktSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Controller
          control={control}
          name="aMarket"
          render={({ field }) => (
            <>
              {H_MARKT_OPTIONS.map((opt) => {
                const isChecked = (field.value ?? []).includes(opt.value)
                const id = `hm-${opt.value}`
                return (
                  <div key={opt.value} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const current = field.value ?? []
                        if (checked) {
                          field.onChange([...current, opt.value])
                        } else {
                          field.onChange(current.filter((v: string) => v !== opt.value))
                        }
                      }}
                    />
                    <Label htmlFor={id}>{t(`step2.hMarktOptions.${opt.value}` as any)}</Label>
                  </div>
                )
              })}
            </>
          )}
        />

        <Controller
          control={control}
          name="aMarketNotes"
          render={({ field }) => (
            <Input
              {...field}
              translate="no"
              className="h-8 w-40 text-sm"
              aria-label={t('step2.hMarktCustomPlaceholder')}
              placeholder={t('step2.hMarktCustomPlaceholder')}
            />
          )}
        />
      </div>

      {errors.aMarket?.message && (
        <p className="text-xs text-destructive">{errors.aMarket.message}</p>
      )}

      <Controller
        control={control}
        name="aMarketMediaUrls"
        render={({ field }) => (
          <ActivationMediaUpload
            value={(field.value ?? []) as ImageFile[]}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  )
}
