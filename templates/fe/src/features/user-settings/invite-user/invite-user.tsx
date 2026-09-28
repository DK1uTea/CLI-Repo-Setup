
'use client'

import { useTranslations } from 'next-intl'
import { useFormState } from 'react-hook-form'
import { Button } from '@/shared/components/ui/button'
import { useBreadcrumbs } from '@/shared/hooks/common/use-breadcrumbs'
import { useInviteUser } from './(hooks)/use-invite-user'
import { InviteUserMatrix } from './(components)/invite-user-matrix'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useRouter } from '@/i18n/navigation'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { ArrowLeftIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const REFERER_LABEL_KEYS = {
  'profile-management': 'profileManagement',
  'user-roles-access': 'userRolesAccess',
} as const

function InviteUserMain() {
  const router = useRouter()
  const t = useTranslations('settings')
  const referer = useSearchParams().get('referer') || 'profile-management'
  const { form, selectedRoleId, setSelectedRoleId, permissions, roles, isMatrixLoading, handleInvite } = useInviteUser()
  const { register, formState: { errors } } = form
  const { isSubmitting } = useFormState({ control: form.control })

  useBreadcrumbs([
    {
      label: t(REFERER_LABEL_KEYS[referer as keyof typeof REFERER_LABEL_KEYS] ?? 'profileManagement'),
      href: `/user-settings?tab=${referer}`,
    },
    { label: t('inviteUser') },
  ])

  return (
    <div className='space-y-7'>
      <div className="flex items-center gap-3">
        <Button
          variant="outline-primary"
          href={`/user-settings?tab=${referer}`}
          className="size-10"
          aria-label={t('back')}
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-[22px] font-semibold">
          {t('inviteUser')}
        </h1>
      </div>
      <form onSubmit={handleInvite} noValidate>
        <div className="space-y-6 ">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6 md:space-y-8">
            <div className='space-y-4'>
              <h2 className="text-base font-medium">{t('userRoles')}</h2>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-foreground/70">
                  {t('emailAddress')}
                </Label>
                <Input
                  id="email"
                  placeholder={t('emailAddress')}
                  type="email"
                  translate="no"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('userRolesPermission')}</h2>
              {isMatrixLoading ? (
                <div className="rounded-xl border border-border overflow-hidden space-y-0">
                  <Skeleton className="h-14 w-full rounded-none" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-none border-t border-border" />
                  ))}
                </div>
              ) : (
                <InviteUserMatrix
                  permissions={permissions}
                  roles={roles}
                  selectedRoleId={selectedRoleId}
                  onRoleChange={setSelectedRoleId}
                />
              )}
            </div>
          </div>

          <div className='sticky bottom-0 z-10 shrink-0 border-y border-border bg-card -mx-6'>
            <div className="flex justify-end gap-3 p-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/user-settings?tab=${referer}`)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
                {t('inviteUser')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default InviteUserMain
