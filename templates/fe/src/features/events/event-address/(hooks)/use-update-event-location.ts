'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { apiProxy } from '@/lib/api'
import { toast } from 'sonner'

export type UpdateLocationPayload = {
  name: string
  street: string
  street2?: string | null
  city: string
  postalCode: string
  state: string
  countryCode: string
  country: string
}

export function useUpdateEventLocation() {
  const queryClient = useQueryClient()
  const t = useTranslations('events.address')

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateLocationPayload }) => {
      await apiProxy.patch(`/etr/locations/${id}`, payload)
    },
    onSuccess: () => {
      toast.success(t('updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['event-locations'] })
    },
    onError: (error) => {
      console.error('Failed to update location:', error)
    },
  })
}
