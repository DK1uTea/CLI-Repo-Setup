'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { SquarePen } from 'lucide-react'
import { dayjs } from '@/lib/date-utils'
import { Button } from '@/shared/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/shared/components/ui/table'
import { StatusBadge, type StatusVariant } from '@/shared/components/ui/status-badge'
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
import { Pagination } from '@/shared/components/ui/pagination'
import { SearchFilterBar } from '@/shared/components/common/search-filter-bar'
import { LazyDropdown } from '@/shared/components/ui/lazy-dropdown'
import { useRolesAccess } from './(hooks)/use-roles-access'
import { useGetListRolesInfinite } from '../user-roles/(hooks)/use-get-list-roles-infinite'
import { ChangeRoleDialog } from './(components)/change-role-dialog'
import { RolesAccessSkeleton } from './(components)/roles-access-skeleton'
import { RolesAccessEmpty } from './(components)/roles-access-empty'
import { SortIcon } from './(components)/sort-icon'
import { ResendInviteButton } from './(components)/resend-invite-button'
import { LoadingIcon } from '@/shared/components/common/icons'


function formatAddedOn(date: string | undefined, locale: string) {
  if (!date) return '-'
  return dayjs.utc(date).locale(locale).format('MMM DD, YYYY • HH:mm')
}

export function UserRolesAccess() {
  const t = useTranslations('settings')
  const locale = useLocale()
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const {
    users,
    pagination,
    isLoading,
    roleFilter,
    setRoleFilter,
    page,
    setPage,
    sortField,
    sortDir,
    handleSort,
    confirmAction,
    setConfirmAction,
    confirmMeta,
    handleConfirm,
    isConfirming,
    changeRoleData,
    setChangeRoleData,
    formatDate,
    getResendExpiresAt,
  } = useRolesAccess()

  const totalPages = pagination?.totalPages ?? 1
  const { data: rolesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetListRolesInfinite()
  const roles = rolesData?.pages.flatMap((p) => p.roles) ?? []
  const selectedRole = roles.find((r) => r.id === roleFilter)
  const roleDropdownLabel = selectedRole ? selectedRole.name : t('allRoles')

  return (
    <div className="space-y-4">
      <SearchFilterBar placeholder={`${t('searchUser')}...`}>
        <LazyDropdown
          label={roleDropdownLabel}
          isActive={!!roleFilter}
          open={roleDropdownOpen}
          onOpenChange={setRoleDropdownOpen}
          items={roles}
          selectedId={roleFilter}
          onSelect={(id) => setRoleFilter(id)}
          allLabel={t('allRoles')}
          getItemId={(r) => r.id}
          getItemLabel={(r) => r.name}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </SearchFilterBar>

      {isLoading ? (
        <RolesAccessSkeleton />
      ) : users.length === 0 ? (
        <RolesAccessEmpty />
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="h-12 bg-muted/30">
                  <TableHead className="pl-4">
                    <button onClick={() => handleSort('email')} className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {t('user')} <SortIcon field="email" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort('firstName')} className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {t('name')} <SortIcon field="firstName" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead>{t('lastLogin')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>
                    <button onClick={() => handleSort('roleId')} className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {t('role')} <SortIcon field="roleId" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort('createdAt')} className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {t('addedOn')} <SortIcon field="createdAt" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort('inviteByEmail')} className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {t('invitedBy')} <SortIcon field="inviteByEmail" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isActive = user.status === 'ACTIVE'
                  return (
                    <TableRow key={user.id} className="h-14">
                      <TableCell className="font-semibold text-sm pl-4">{user.email}</TableCell>
                      <TableCell className="text-sm font-semibold">
                        {user.firstName || user.lastName
                          ? `${user.firstName} ${user.lastName}`.trim()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.lastLoginAt ?? undefined, true)}
                      </TableCell>
                      <TableCell>
                        <UserStatusBadge status={user.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-muted-foreground flex-1">{user.role.name}</span>
                          {isActive && (
                            <Button
                              type="button"
                              variant="ghost-primary"
                              size="icon-sm"
                              onClick={() => setChangeRoleData({ userId: user.id, currentRole: user.role.name, email: user.email })}
                              aria-label={t('changeRole')}
                              title={t('changeRole')}
                              className='bg-muted'
                            >
                              <SquarePen className='size-3' />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatAddedOn(user.createdAt, locale)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.inviteBy || '-'}
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-start gap-8">
                          {user.status === 'PENDING' && (
                            <>
                              {user.isAllowRevoke && (
                                <ResendInviteButton
                                  expiresAt={getResendExpiresAt(user.invitationId)}
                                  onClick={() => setConfirmAction({ type: 'resendInvite', id: user.invitationId })}
                                />
                              )}
                              {user.isAllowRemoveUser && (
                                <Button
                                  type="button"
                                  variant="link"
                                  onClick={() => setConfirmAction({ type: 'deleteInvite', id: user.invitationId })}
                                  className="h-auto p-0 text-xs text-destructive underline hover:text-destructive"
                                >
                                  {t('deleteInvite')}
                                </Button>
                              )}
                            </>
                          )}
                          {isActive && user.isAllowRevoke && (
                            <Button
                              type="button"
                              variant="link"
                              onClick={() => setConfirmAction({ type: 'revoke', id: user.invitationId ?? user.id })}
                              className="h-auto p-0 text-xs text-destructive underline hover:text-destructive"
                            >
                              {t('revokeAccess')}
                            </Button>
                          )}
                          {user.status === 'BANNED' && (
                            <>
                              {user.isAllowGiveAccess && (
                                <Button
                                  type="button"
                                  variant="link"
                                  onClick={() => setConfirmAction({ type: 'grant', id: user.invitationId ?? user.id })}
                                  className="h-auto p-0 text-xs underline"
                                >
                                  {t('grantAccess')}
                                </Button>
                              )}
                              {user.isAllowRemoveUser && (
                                <Button
                                  type="button"
                                  variant="link"
                                  onClick={() => setConfirmAction({ type: 'deleteInvite', id: user.invitationId ?? user.id })}
                                  className="h-auto p-0 text-xs text-destructive underline hover:text-destructive"
                                >
                                  {t('deleteInvite')}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="justify-end"
            />
          )}
        </>
      )}

      <AlertDialog open={!!confirmAction} onOpenChange={(v) => !v && setConfirmAction(null)}>
        <AlertDialogContent onClose={() => setConfirmAction(null)}>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction ? confirmMeta[confirmAction.type].title : ''}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction ? confirmMeta[confirmAction.type].description : ''}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant={confirmAction && confirmMeta[confirmAction.type].destructive ? 'destructive' : 'default'}
              onClick={(e) => {
                e.preventDefault()
                handleConfirm()
              }}
              disabled={isConfirming}
            >
              {isConfirming
                ? <LoadingIcon className="size-4 text-current" />
                : (confirmAction ? confirmMeta[confirmAction.type].action : '')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ChangeRoleDialog
        open={!!changeRoleData}
        userId={changeRoleData?.userId ?? null}
        currentRole={changeRoleData?.currentRole ?? ''}
        email={changeRoleData?.email ?? ''}
        onClose={() => setChangeRoleData(null)}
      />
    </div>
  )
}

type StatusConfig = {
  label: 'statusActive' | 'statusInvited' | 'statusDisabled'
  variant: StatusVariant
}

const STATUS_BADGE: Record<string, StatusConfig> = {
  ACTIVE: { label: 'statusActive', variant: 'active' },
  PENDING: { label: 'statusInvited', variant: 'invited' },
  BANNED: { label: 'statusDisabled', variant: 'disabled' },
}

function UserStatusBadge({ status }: { status: string }) {
  const t = useTranslations('settings')
  const config = STATUS_BADGE[status]
  if (!config) return null
  return <StatusBadge variant={config.variant}>{t(config.label)}</StatusBadge>
}
