'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { SettingUploadAvatar } from './setting-upload-avatar'
import type { ProfileSettingFormData } from '../../(hooks)/use-get-profile-setting'
import type { ProfileFormValues } from '../../(helpers)/profile-schema'

export function SettingPersonalInfo({ profileSetting }: { profileSetting?: ProfileSettingFormData }) {
  const t = useTranslations('settings')
  const { control } = useFormContext<ProfileFormValues>()
  const { errors } = useFormState<ProfileFormValues>()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    setAvatarUrl(profileSetting?.avatar ?? null)
  }, [profileSetting?.avatar])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('personalInformation')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SettingUploadAvatar
          imageUrl={avatarUrl}
          onUpload={(url) => setAvatarUrl(url)}
          onRemove={() => setAvatarUrl(null)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="profile-first-name">{t('firstName')}</Label>
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => (
                <Input
                  id="profile-first-name"
                  placeholder={t('firstNamePlaceholder')}
                  translate="no"
                  aria-invalid={errors.firstName ? 'true' : 'false'}
                  {...field}
                  value={field.value ?? ''}
                  className='bg-input'
                />
              )}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-last-name">{t('lastName')}</Label>
            <Controller
              control={control}
              name="lastName"
              render={({ field }) => (
                <Input
                  id="profile-last-name"
                  placeholder={t('lastNamePlaceholder')}
                  translate="no"
                  aria-invalid={errors.lastName ? 'true' : 'false'}
                  {...field}
                  value={field.value ?? ''}
                  className='bg-input'
                />
              )}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="profile-email">{t('emailAddress')}</Label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  id="profile-email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  translate="no"
                  disabled
                  readOnly
                  {...field}
                  value={field.value ?? profileSetting?.email ?? ''}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-phone">{t('phoneNumber')}</Label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input
                  id="profile-phone"
                  placeholder={t('phonePlaceholder')}
                  translate="no"
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  {...field}
                  value={field.value ?? ''}
                />
              )}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
