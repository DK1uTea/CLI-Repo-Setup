'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { ComponentGuard } from '@/shared/components/common/component-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const DRAFT_ACCESS_PERMISSIONS = [
  PERMISSIONS.CustomerActivation.InternalAdmin,
  PERMISSIONS.CustomerActivation.Sale,
]

export function ActivationViewHeader() {
  const t = useTranslations('activationView')

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-[22px] font-semibold">{t('header.title')}</h1>
      <ComponentGuard requiredKeys={DRAFT_ACCESS_PERMISSIONS}>
        <Button asChild>
          <Link href="/customer-activation/new-activation">
            {t('header.newActivation')}
            <PlusIcon className="size-4" />
          </Link>
        </Button>
      </ComponentGuard>
    </div>
  )
}
