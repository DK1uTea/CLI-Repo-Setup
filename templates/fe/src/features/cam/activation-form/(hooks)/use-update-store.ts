'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { apiProxy } from '@/lib/api'
import type { StoreFormData } from '../(helpers)/activation-schema'

async function updateStore(id: string, data: StoreFormData): Promise<void> {
  await apiProxy.put(
    `/cam/stores/${id}`,
    {
      storeName: data.storeName,
      storeAddress: data.storeAddress,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
    },
    { _skipToast: true } as object,
  )
}

export function useUpdateStore() {
  const queryClient = useQueryClient()
  const t = useTranslations('activationForm.store')

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StoreFormData }) => updateStore(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cam-stores'] })
      queryClient.invalidateQueries({ queryKey: ['cam-store-detail', id] })
      toast.success(t('updateSuccess'))
    },
  })
}
