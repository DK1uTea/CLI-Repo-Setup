'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { apiProxy } from '@/lib/api'

async function deleteInvite(id: string) {
  const { data } = await apiProxy.delete('/user/invitation', { data: { id } })
  return data
}

export function useDeleteInvite() {
  const t = useTranslations('settings')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteInvite,
    onSuccess: () => {
      toast.success(t('deleteInviteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['user-access-list'] })
    },
  })
}
