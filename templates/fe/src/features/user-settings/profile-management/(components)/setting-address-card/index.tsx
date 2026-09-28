'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { SettingAddressDialog, type AddressType, type AddressValue } from './setting-address-dialog'
import { COUNTRIES } from '../../(helpers)/profile-constants'
import type { ProfileSettingFormData } from '../../(hooks)/use-get-profile-setting'
import type { ProfileAddressState } from '../../(hooks)/use-submit-profile-setting'

type SettingAddressCardProps = {
  profileSetting?: ProfileSettingFormData
  addresses: ProfileAddressState
  onAddressChange: (type: AddressType, values: AddressValue) => void
}

export function SettingAddressCard({
  profileSetting,
  addresses,
  onAddressChange,
}: SettingAddressCardProps) {
  const t = useTranslations('settings')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeAddressType, setActiveAddressType] = useState<AddressType>('primary')

  const openDialog = (type: AddressType) => {
    setActiveAddressType(type)
    setDialogOpen(true)
  }

  const formatAddress = (val?: AddressValue | null) => {
    if (!val) return ''
    const countryLabel = COUNTRIES.find((c) => c.value === val.country)?.label ?? val.country
    return [val.address, val.city, val.postalCode, countryLabel].filter(Boolean).join(', ')
  }

  const getAddressDisplay = (type: AddressType) => formatAddress(addresses[type])

  const getInitialAddressDisplay = (type: AddressType) => {
    if (type === 'primary') return formatAddress(profileSetting?.address)
    if (type === 'billing') return formatAddress(profileSetting?.billingAddress)
    return formatAddress(profileSetting?.shippingAddress)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('addressInformation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(['primary', 'billing', 'shipping'] as AddressType[]).map((type) => (
              <div key={type} className="space-y-2">
                <Label htmlFor={`profile-address-${type}`}>{t(`${type}Address` as const)}</Label>
                <Input
                  id={`profile-address-${type}`}
                  placeholder={t('addressPlaceholder')}
                  translate="no"
                  readOnly
                  value={getAddressDisplay(type) || getInitialAddressDisplay(type)}
                  onFocus={() => openDialog(type)}
                  onClick={() => openDialog(type)}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <SettingAddressDialog
        open={dialogOpen}
        addressType={activeAddressType}
        defaultValues={addresses[activeAddressType] ?? undefined}
        onClose={() => setDialogOpen(false)}
        onSave={onAddressChange}
      />
    </>
  )
}
