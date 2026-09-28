'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useAdminStoreDetail } from '../../(hooks)/use-admin-store-detail'
import { useUpdateAdminStore } from '../../(hooks)/use-admin-store-actions'
import { useStoreForm } from '@/features/cam/activation-form/(hooks)/use-store-form'

const FORM_ID = 'store-edit-form'

type Props = {
  storeId: string
  onClose: () => void
}

export function StoreEditDrawer({ storeId, onClose }: Props) {
  const t = useTranslations('activationForm.store')
  const tAdmin = useTranslations('activationView.store')

  const { store, isLoading } = useAdminStoreDetail(storeId)
  const { mutate: updateStore, isPending } = useUpdateAdminStore(storeId, onClose)

  const { control, handleSubmit, reset, formState: { errors } } = useStoreForm({})

  useEffect(() => {
    if (store) {
      reset({
        storeName: store.storeName,
        storeAddress: store.storeAddress,
        contactName: store.contactName,
        contactPhone: store.contactPhone,
        contactEmail: store.contactEmail,
      })
    }
  }, [store, reset])

  function onSubmit(data: Parameters<typeof updateStore>[0]) {
    updateStore({
      storeName: data.storeName,
      storeAddress: data.storeAddress,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
    })
  }

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" showCloseButton className="flex flex-col gap-0 p-0" style={{ maxWidth: 480 }} aria-describedby={undefined}>
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle>{tAdmin('editTitle')}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 _custom-scroll">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div>
              <p className="mb-4 font-semibold text-foreground">{t('ownerContact')}</p>
              <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {([
                  { name: 'storeName', label: t('fieldStoreName'), placeholder: t('fieldStoreNamePlaceholder'), type: 'text' },
                  { name: 'storeAddress', label: t('fieldAddress'), placeholder: t('fieldAddressPlaceholder'), type: 'text' },
                  { name: 'contactName', label: t('fieldContactName'), placeholder: t('fieldContactNamePlaceholder'), type: 'text' },
                  { name: 'contactPhone', label: t('fieldPhone'), placeholder: t('fieldPhonePlaceholder'), type: 'text' },
                  { name: 'contactEmail', label: t('fieldEmail'), placeholder: t('fieldEmailPlaceholder'), type: 'email' },
                ] as const).map(({ name, label, placeholder, type }) => (
                  <div key={name} className="space-y-1.5">
                    <Label htmlFor={`edit-${name}`}>{label}</Label>
                    <Controller
                      control={control}
                      name={name}
                      render={({ field }) => (
                        <Input
                          id={`edit-${name}`}
                          type={type}
                          placeholder={placeholder}
                          aria-invalid={errors[name] ? 'true' : 'false'}
                          {...field}
                          value={field.value ?? ''}
                        />
                      )}
                    />
                    {errors[name] && (
                      <p className="text-xs text-destructive">{errors[name]?.message}</p>
                    )}
                  </div>
                ))}
              </form>
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border px-6 py-4 flex-row gap-3">
          <Button variant="outline" className="flex-1 rounded-full border-primary text-primary" onClick={onClose}>
            {tAdmin('cancel')}
          </Button>
          <Button form={FORM_ID} type="submit" className="flex-1 rounded-full" disabled={isPending}>
            {tAdmin('saveChanges')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
