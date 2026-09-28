'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { apiProxy } from '@/lib/api'

async function revokeAccount(targetId: string) {
  const { data } = await apiProxy.post('/user/revoke-account', { targetId })
  return data
}

export function useRevokeAccount() {
  const t = useTranslations('settings')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: revokeAccount,
    onSuccess: () => {
      toast.success(t('revokeAccessSuccess'))
      queryClient.invalidateQueries({ queryKey: ['user-access-list'] })
    },
  })
}
