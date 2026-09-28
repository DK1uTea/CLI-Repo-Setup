'use client'

import { useTranslations } from 'next-intl'
import { useFormState, FormProvider } from 'react-hook-form'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useBreadcrumbs } from '@/shared/hooks/common/use-breadcrumbs'
import { useAddRoleForm } from './(hooks)/use-add-role-form'
import { RoleInfoForm } from './(components)/role-info-form'
import { RolePermissions } from './(components)/role-permissions'

function AddUserRoleMain() {
  const t = useTranslations('settings')
  const { form, onSubmit, isPending } = useAddRoleForm()
  const { isSubmitting } = useFormState({ control: form.control })
  const isLoading = isSubmitting || isPending

  useBreadcrumbs([
    { label: t('manageUserRoles'), href: '/user-settings?tab=manage-user-roles' },
    { label: t('addRole') },
  ])

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-3">
        <Button variant="outline-primary" href="/user-settings?tab=manage-user-roles" className="size-10">
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-[22px] font-semibold">{t('addRole')}</h1>
      </div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <div className="space-y-6">
            <RoleInfoForm />
            <RolePermissions />

            <div className="sticky bottom-0 z-10 shrink-0 border-y border-border bg-card -mx-6">
              <div className="flex justify-end gap-3 p-4">
                <Button
                  type="button"
                  variant="outline"
                  href="/user-settings?tab=manage-user-roles"
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isLoading} isLoading={isLoading}>
                  {t('addRole')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default AddUserRoleMain