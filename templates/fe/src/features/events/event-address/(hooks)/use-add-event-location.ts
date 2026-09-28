'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { apiProxy } from '@/lib/api'
import { toast } from 'sonner'

export type AddLocationPayload = {
  name: string
  street: string
  street2?: string | null
  city: string
  postalCode: string
  state: string
  countryCode: string
  country: string
}

export function useAddEventLocation() {
  const queryClient = useQueryClient()
  const t = useTranslations('events.address')

  return useMutation({
    mutationFn: async (payload: AddLocationPayload) => {
      await apiProxy.post('/etr/locations', payload)
    },
    onSuccess: () => {
      toast.success(t('createSuccess'))
      queryClient.invalidateQueries({ queryKey: ['event-locations'] })
    },
    onError: (error) => {
      console.error('Failed to create location:', error)
    },
  })
}
