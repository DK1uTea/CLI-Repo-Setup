'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { COUNTRIES } from '../../(helpers)/profile-constants'

export type AddressType = 'primary' | 'billing' | 'shipping'

export interface AddressValue {
  address: string
  city: string
  region: string
  country: string
  postalCode: string
}

interface SettingAddressDialogProps {
  open: boolean
  addressType: AddressType
  defaultValues?: Partial<AddressValue>
  onClose: () => void
  onSave: (type: AddressType, values: AddressValue) => void
}

const EMPTY: AddressValue = { address: '', city: '', region: '', country: 'DE', postalCode: '' }

const REQUIRED_FIELDS: (keyof AddressValue)[] = ['address', 'city', 'region', 'country', 'postalCode']

export function SettingAddressDialog({
  open,
  addressType,
  defaultValues,
  onClose,
  onSave,
}: SettingAddressDialogProps) {
  const t = useTranslations('settings')
  const tErrors = useTranslations('fieldErrors')
  const [values, setValues] = useState<AddressValue>({ ...EMPTY, ...defaultValues })
  const [errors, setErrors] = useState<Partial<Record<keyof AddressValue, boolean>>>({})

  useEffect(() => {
    setValues({ ...EMPTY, ...defaultValues })
    setErrors({})
  }, [defaultValues, open])

  const set = (field: keyof AddressValue) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: false }))
  }

  const titleMap: Record<AddressType, string> = {
    primary: t('enterPrimaryAddress'),
    billing: t('enterBillingAddress'),
    shipping: t('enterShippingAddress'),
  }

  const handleClose = () => {
    setValues({ ...EMPTY, ...defaultValues })
    setErrors({})
    onClose()
  }

  const handleSave = () => {
    const nextErrors: Partial<Record<keyof AddressValue, boolean>> = {}
    REQUIRED_FIELDS.forEach((field) => {
      if (!values[field]?.trim()) nextErrors[field] = true
    })

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors)
      return
    }

    onSave(addressType, values)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent aria-describedby={undefined} className="gap-6 sm:max-w-200 sm:w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{titleMap[addressType]}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-address" className="text-sm text-muted-foreground">{t('address')}</Label>
            <Input
              id="addr-address"
              placeholder="123 Main St, Apt 4B"
              translate="no"
              value={values.address}
              onChange={set('address')}
              className={cn('bg-input', errors.address && 'border-destructive')}
            />
            {errors.address && <p className="text-sm text-destructive">{tErrors('required')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-city" className="text-sm text-muted-foreground">{t('city')}</Label>
            <Input
              id="addr-city"
              placeholder="Munich"
              translate="no"
              value={values.city}
              onChange={set('city')}
              className={cn('bg-input', errors.city && 'border-destructive')}
            />
            {errors.city && <p className="text-sm text-destructive">{tErrors('required')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-region" className="text-sm text-muted-foreground">{t('region')}</Label>
            <Input
              id="addr-region"
              placeholder="Bavaria"
              translate="no"
              value={values.region}
              onChange={set('region')}
              className={cn('bg-input', errors.region && 'border-destructive')}
            />
            {errors.region && <p className="text-sm text-destructive">{tErrors('required')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-country" className="text-sm text-muted-foreground">{t('country')}</Label>
            <Select
              value={values.country}
              onValueChange={(val) => {
                setValues((prev) => ({ ...prev, country: val }))
                setErrors((prev) => ({ ...prev, country: false }))
              }}
            >
              <SelectTrigger id="addr-country" size="lg" className={cn('w-full', errors.country && 'border-destructive')}>
                <SelectValue placeholder={t('selectCountry')} />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && <p className="text-sm text-destructive">{tErrors('required')}</p>}
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="addr-postal" className="text-sm text-muted-foreground">{t('postalCode')}</Label>
            <Input
              id="addr-postal"
              placeholder="80331"
              translate="no"
              value={values.postalCode}
              onChange={set('postalCode')}
              className={cn('bg-input', errors.postalCode && 'border-destructive')}
            />
            {errors.postalCode && <p className="text-sm text-destructive">{tErrors('required')}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline-primary" onClick={handleClose}>{t('cancel')}</Button>
          <Button onClick={handleSave}>{t('saveAddress')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
