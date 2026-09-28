'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buildStoreSchema, type StoreFormData } from '../(helpers)/activation-schema'

type Props = {
  defaultValues?: Partial<StoreFormData>
}

export function useStoreForm({ defaultValues }: Props = {}) {
  const schema = buildStoreSchema()
  const storeId = defaultValues?.storeId ?? ''
  const storeName = defaultValues?.storeName ?? ''
  const storeAddress = defaultValues?.storeAddress ?? ''
  const contactName = defaultValues?.contactName ?? ''
  const contactPhone = defaultValues?.contactPhone ?? ''
  const contactEmail = defaultValues?.contactEmail ?? ''

  const form = useForm<StoreFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      storeId,
      storeName,
      storeAddress,
      contactName,
      contactPhone,
      contactEmail,
    },
  })

  useEffect(() => {
    form.reset({
      storeId,
      storeName,
      storeAddress,
      contactName,
      contactPhone,
      contactEmail,
    })
  }, [contactEmail, contactName, contactPhone, form, storeAddress, storeId, storeName])

  return form
}
