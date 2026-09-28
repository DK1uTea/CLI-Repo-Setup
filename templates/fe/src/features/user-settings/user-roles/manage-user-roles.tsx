'use client'

import { useTranslations } from 'next-intl'
import { PlusIcon } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/shared/components/ui/table'
import { Button } from '@/shared/components/ui/button'
import { RoleStatusBadge } from './(components)/role-status-badge'
import { Pagination } from '@/shared/components/ui/pagination'
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
import { SearchFilterBar } from '@/shared/components/common/search-filter-bar'
import { cn } from '@/lib/utils'
import { useManageRoles } from './(hooks)/use-manage-roles'
import { ManageRolesSkeleton } from './(components)/manage-roles-skeleton'
import { ManageRolesEmpty } from './(components)/manage-roles-empty'

export function ManageUserRoles() {
  const t = useTranslations('settings')
  const {
    roles,
    pagination,
    isLoading,
    page,
    setPage,
    deletedRoles,
    setDeletedRoles,
    confirmAction,
    setConfirmAction,
    confirmMeta,
    handleConfirm,
    isConfirming,
  } = useManageRoles()

  const totalPages = pagination?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchFilterBar
          placeholder={`${t('searchRole')}...`}
          searchKey="keyword"
        >
          <Button
            variant={deletedRoles ? 'default' : 'outline'}
            className={cn(
              'h-8 text-sm transition-colors',
              deletedRoles
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-card text-foreground hover:bg-muted'
            )}
            onClick={() => setDeletedRoles(deletedRoles ? null : true)}
          >
            {t('showArchivedRoles')}
          </Button>
        </SearchFilterBar>
        <div className="flex-1" />
        <Button
          className="shrink-0 gap-1.5"
          href="/user-settings/add-user-role"
        >
          {t('addRole')}
          <PlusIcon className="size-4" />
        </Button>
      </div>

      {isLoading ? (
        <ManageRolesSkeleton />
      ) : roles.length === 0 ? (
        <ManageRolesEmpty />
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="h-12 bg-muted/30">
                  <TableHead className="font-medium text-foreground">{t('roleColumn')}</TableHead>
                  <TableHead className="font-medium text-foreground w-48">{t('descriptionColumn')}</TableHead>
                  <TableHead className="font-medium text-foreground">{t('ipAccessColumn')}</TableHead>
                  <TableHead className="font-medium text-foreground">{t('createdByColumn')}</TableHead>
                  <TableHead className="font-medium text-foreground">{t('statusColumn')}</TableHead>
                  <TableHead className="pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} className="h-14">
                    <TableCell className="pl-4 font-semibold text-sm">{role.name}</TableCell>
                    <TableCell className="max-w-45 text-sm whitespace-normal wrap-break-word text-muted-foreground">
                      {role.description}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {role.ip && role.ip.trim() !== '' ? role.ip : t('all')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {role.isSystem ? t('system') : (role.createdBy || t('system'))}
                    </TableCell>
                    <TableCell className="text-sm">
                      <RoleStatusBadge status={role.status} />
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center gap-4 justify-end">
                        {!role.isSystem && (
                          <>
                            {!deletedRoles && (
                              <>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                                  onClick={() => setConfirmAction({ type: 'duplicate', id: role.id, name: role.name })}
                                >
                                  {t('duplicate')}
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                                  href={`/user-settings/edit-user-role/${role.id}`}
                                >
                                  {t('edit')}
                                </Button>
                              </>
                            )}
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-sm text-destructive hover:underline"
                              onClick={() => setConfirmAction({ type: 'delete', id: role.id, name: role.name })}
                            >
                              {t('delete')}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              {confirmAction ? confirmMeta[confirmAction.type].action : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
