'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiProxy } from '@/lib/api'

import { useTranslations } from 'next-intl'

type UpdateActivationStatusDto = {
  id: string
  status: string
}

async function updateActivationStatus({ id, status }: UpdateActivationStatusDto) {
  const { data } = await apiProxy.patch(`/cam/activations/${id}/status`, { status })
  return data
}

export function useUpdateActivationStatus() {
  const queryClient = useQueryClient()
  const t = useTranslations('activationView')

  return useMutation({
    mutationFn: updateActivationStatus,
    onSuccess: (_, { id }) => {
      toast.success(t('updateStatusSuccess'))
      queryClient.invalidateQueries({ queryKey: ['cam-activations-grouped'] })
      queryClient.invalidateQueries({ queryKey: ['cam-activation-admin-list'] })
      queryClient.invalidateQueries({ queryKey: ['cam-activation-detail', id] })
    },
    onError: () => {
      toast.error(t('updateStatusError'))
    }
  })
}
