'use client'

import { useTranslations } from 'next-intl'
import { useFormContext, useFormState } from 'react-hook-form'
import { UnsavedChangesDialog } from '@/shared/components/common/unsaved-changes-dialog'
import { useUnsavedChanges } from '@/shared/hooks/common/use-unsaved-changes'
import { SettingPersonalInfo } from './(components)/personal-info'
import { SettingAddressCard } from './(components)/setting-address-card'
import { SettingLanguageRegion } from './(components)/setting-language-region'
import { SettingThemeToggle } from './(components)/setting-theme-toggle'
import type { ProfileSettingFormData } from './(hooks)/use-get-profile-setting'
import type { ProfileAddressState } from './(hooks)/use-submit-profile-setting'
import type { AddressType, AddressValue } from './(components)/setting-address-card/setting-address-dialog'
import type { ProfileFormValues } from './(helpers)/profile-schema'

type ProfileManagementProps = {
  profileSetting?: ProfileSettingFormData
  addressState: ProfileAddressState
  onAddressChange: (type: AddressType, values: AddressValue) => void
}

export function ProfileManagement({
  profileSetting,
  addressState,
  onAddressChange,
}: ProfileManagementProps) {
  const t = useTranslations('settings')
  const { control, reset } = useFormContext<ProfileFormValues>()
  const { isDirty } = useFormState({ control })

  const { dialogProps } = useUnsavedChanges({
    isDirty,
    onDiscard: () => reset(),
  })

  return (
    <div className="space-y-6">
      <SettingPersonalInfo profileSetting={profileSetting} />
      <SettingAddressCard
        profileSetting={profileSetting}
        addresses={addressState}
        onAddressChange={onAddressChange}
      />
      <SettingLanguageRegion profileSetting={profileSetting} />
      <SettingThemeToggle />
      <UnsavedChangesDialog
        {...dialogProps}
        description={t('unsavedChangesDescription')}
      />
    </div>
  )
}
