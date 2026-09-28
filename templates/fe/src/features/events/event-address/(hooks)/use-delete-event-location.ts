'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { apiProxy } from '@/lib/api'
import { toast } from 'sonner'

export function useDeleteEventLocation() {
  const queryClient = useQueryClient()
  const t = useTranslations('events.address')

  return useMutation({
    mutationFn: async (id: string) => {
      await apiProxy.delete(`/etr/locations/${id}`)
    },
    onSuccess: () => {
      toast.success(t('deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['event-locations'] })
    },
    onError: (error) => {
      console.error('Failed to delete location:', error)
    },
  })
}
