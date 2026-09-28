'use client'

import { useTranslations } from 'next-intl'
import { useFormState, FormProvider } from 'react-hook-form'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useBreadcrumbs } from '@/shared/hooks/common/use-breadcrumbs'
import { RoleInfoForm } from '../add-user-role/(components)/role-info-form'
import { RolePermissions } from '../add-user-role/(components)/role-permissions'
import { useEditRoleForm } from './(hooks)/use-edit-role-form'

type Props = { id: string }

function EditUserRoleMain({ id }: Props) {
  const t = useTranslations('settings')
  const { form, onSubmit, isPending, isLoading } = useEditRoleForm(id)
  const { isSubmitting } = useFormState({ control: form.control })
  const isBusy = isSubmitting || isPending

  useBreadcrumbs([
    { label: t('manageUserRoles'), href: '/user-settings?tab=manage-user-roles' },
    { label: t('editRole') },
  ])

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-3">
        <Button variant="outline-primary" href="/user-settings?tab=manage-user-roles" className="size-10">
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-[22px] font-semibold">{t('editRole')}</h1>
      </div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <div className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-13.5 w-full" />
                <Skeleton className="h-13.5 w-full" />
              </div>
            ) : (
              <RoleInfoForm />
            )}
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={`perm-skel-${i}`} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <RolePermissions />
            )}

            <div className="sticky bottom-0 z-10 shrink-0 border-y border-border bg-card -mx-6">
              <div className="flex justify-end gap-3 p-4">
                <Button
                  type="button"
                  variant="outline"
                  href="/user-settings?tab=manage-user-roles"
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isBusy || isLoading} isLoading={isBusy}>
                  {t('saveChanges')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default EditUserRoleMain
