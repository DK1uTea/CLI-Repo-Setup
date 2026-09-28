'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { apiProxy } from '@/lib/api'

async function resendInvite(id: string) {
  const { data } = await apiProxy.post('/user/resend-invite-user', { id })
  return data
}

export function useResendInvite() {
  const t = useTranslations('settings')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: resendInvite,
    onSuccess: () => {
      toast.success(t('resendInviteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['user-access-list'] })
    },
  })
}
