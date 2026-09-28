'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import { apiProxy } from '@/lib/api'

type DuplicateRoleResponse = {
  id: string
}

async function duplicateRole(id: string): Promise<DuplicateRoleResponse> {
  const response = await apiProxy.post(`/roles/${id}/duplicate`)
  return response.data.data as DuplicateRoleResponse
}

export function useDuplicateRole() {
  const t = useTranslations('settings')
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: duplicateRole,
    onSuccess: (duplicatedRole) => {
      toast.success(t('duplicateRoleSuccess'))
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['roles-list'], refetchType: 'none' }),
        queryClient.invalidateQueries({ queryKey: ['roles-list-infinite'], refetchType: 'none' }),
      ])
      router.push(`/user-settings/edit-user-role/${duplicatedRole.id}`)
    },
  })
}
