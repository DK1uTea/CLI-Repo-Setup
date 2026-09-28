'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { apiProxy } from '@/lib/api'

async function grantAccount(targetId: string) {
  const { data } = await apiProxy.post('/user/grant-account', { targetId })
  return data
}

export function useGrantAccount() {
  const t = useTranslations('settings')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: grantAccount,
    onSuccess: () => {
      toast.success(t('grantAccessSuccess'))
      queryClient.invalidateQueries({ queryKey: ['user-access-list'] })
    },
  })
}
