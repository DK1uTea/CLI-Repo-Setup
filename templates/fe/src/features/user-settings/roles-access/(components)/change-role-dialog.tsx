'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/shared/components/ui/alert-dialog'
import { LoadingIcon } from '@/shared/components/common/icons'
import { SelectFloat } from '@/shared/components/ui/select-float'
import { SelectItem } from '@/shared/components/ui/select'
import { useGetListRolesInfinite } from '../../user-roles/(hooks)/use-get-list-roles-infinite'
import { useChangeRole } from '../(hooks)/use-change-role'

type Props = {
  open: boolean
  userId: string | null
  currentRole: string
  email: string
  onClose: () => void
}

export function ChangeRoleDialog({ open, userId, currentRole, email, onClose }: Props) {
  const t = useTranslations('settings')
  const [selectedRoleId, setSelectedRoleId] = useState('')

  const { data: rolesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetListRolesInfinite()
  const changeRole = useChangeRole()

  const allRoles = rolesData?.pages.flatMap((p) => p.roles) ?? []
  const availableRoles = allRoles.filter((r) => r.name !== currentRole && r.name !== 'Administrator')

  const handleConfirm = async () => {
    if (!userId || !selectedRoleId) return
    await changeRole.mutateAsync({ targetId: userId, roleId: selectedRoleId })
    setSelectedRoleId('')
    onClose()
  }

  const handleClose = () => {
    setSelectedRoleId('')
    onClose()
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <AlertDialogContent onClose={handleClose} className="md:max-w-lg!">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('changeUserRole')}</AlertDialogTitle>
          <AlertDialogDescription>{email}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-1">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('currentRole')}</p>
            <p className="text-sm font-medium">{currentRole}</p>
          </div>
          <div>
            <SelectFloat
              label={t('selectNewRole')}
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              onLoadMore={fetchNextPage}
              hasMore={hasNextPage}
              loadingMore={isFetchingNextPage}
            >
              {availableRoles.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectFloat>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={!selectedRoleId || changeRole.isPending}
          >
            {changeRole.isPending
              ? <LoadingIcon className="size-4 text-current" />
              : t('changeRole')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
