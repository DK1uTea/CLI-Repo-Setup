'use client'

import { useTranslations } from 'next-intl'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useFormContext, useWatch } from 'react-hook-form'
import { DATE_FORMAT_OPTIONS } from '../(helpers)/profile-constants'
import type { ProfileSettingFormData } from '../(hooks)/use-get-profile-setting'
import type { ProfileFormValues } from '../(helpers)/profile-schema'

export function SettingLanguageRegion({ profileSetting }: { profileSetting?: ProfileSettingFormData }) {
  const t = useTranslations('settings')
  const { setValue } = useFormContext<ProfileFormValues>()
  const preferredLanguage = useWatch<ProfileFormValues, 'preferredLanguage'>({ name: 'preferredLanguage' })
  const timezone = useWatch<ProfileFormValues, 'timezone'>({ name: 'timezone' })
  const currency = useWatch<ProfileFormValues, 'currency'>({ name: 'currency' })
  const dateFormat = useWatch<ProfileFormValues, 'dateFormat'>({ name: 'dateFormat' })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('languageRegionSettings')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="setting-language" className="text-sm text-muted-foreground">{t('preferredLanguage')}</Label>
            <Select
              value={preferredLanguage || profileSetting?.preferredLanguage || 'en'}
              onValueChange={(value) => setValue('preferredLanguage', value, { shouldDirty: true })}
            >
              <SelectTrigger id="setting-language" size="lg" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('languageEnglish')}</SelectItem>
                <SelectItem value="de">{t('languageGerman')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="setting-timezone" className="text-sm text-muted-foreground">{t('timeZone')}</Label>
            <Select
              value={timezone || profileSetting?.timezone || 'Europe/Berlin'}
              onValueChange={(value) => setValue('timezone', value, { shouldDirty: true })}
            >
              <SelectTrigger id="setting-timezone" size="lg" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="setting-currency" className="text-sm text-muted-foreground">{t('currency')}</Label>
            <Select
              value={currency || profileSetting?.currency || 'EUR'}
              onValueChange={(value) => setValue('currency', value, { shouldDirty: true })}
            >
              <SelectTrigger id="setting-currency" size="lg" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="setting-date-format" className="text-sm text-muted-foreground">{t('dateFormat')}</Label>
            <Select
              value={dateFormat || profileSetting?.dateFormat || 'DD/MM/YYYY'}
              onValueChange={(value) => setValue('dateFormat', value as ProfileFormValues['dateFormat'], { shouldDirty: true })}
            >
              <SelectTrigger id="setting-date-format" size="lg" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
