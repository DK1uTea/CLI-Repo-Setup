'use client'

import { useFormContext, useFormState, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'
import { getAhMarktLocations } from '../../../(helpers)/activation-form-options'
import type { ActivationStep2Data } from '../../../(helpers)/activation-step2-schema'
import type { ImageFile } from '@/shared/components/ui/upload-dropzone'
import { ActivationMediaUpload } from './activation-media-upload'

const AH_MARKT_OPTIONS = getAhMarktLocations()

export function AhMarketInput() {
  const t = useTranslations('activationForm')
  const { control } = useFormContext<ActivationStep2Data>()
  const { errors } = useFormState({ control })

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <p className="font-semibold text-foreground">
          {t('step2.ahMarketTitle')}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{t('step2.ahMarketSubtitle')}</p>
      </div>

      <Controller
        control={control}
        name="ahMarket"
        render={({ field }) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AH_MARKT_OPTIONS.map((opt) => {
              const isChecked = (field.value ?? []).includes(opt.value)
              const id = `ahm-${opt.value}`
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
                  <Label htmlFor={id}>{t(`step2.ahMarketOptions.${opt.value}` as any)}</Label>
                </div>
              )
            })}
          </div>
        )}
      />

      {errors.ahMarket?.message && (
        <p className="text-xs text-destructive">{errors.ahMarket.message}</p>
      )}

      <Controller
        control={control}
        name="ahMarketMediaUrls"
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
