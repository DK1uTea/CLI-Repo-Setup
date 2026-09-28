'use client'

import { useUserStore } from '@/shared/stores/use-user-store'
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions'
import { ForbiddenView } from '@/shared/components/common/forbidden-view'
import { ActivationViewMainSkeleton } from './activation-view-main-skeleton'
import { ActivationViewAdmin } from './activation-view-admin'
import { ActivationViewOther } from './activation-view-other'

const OTHER_KEYS = [
  PERMISSIONS.CustomerActivation.Sale,
  PERMISSIONS.CustomerActivation.PrintingAgency,
  PERMISSIONS.CustomerActivation.InstallerAgency,
]

export function ActivationViewMain() {
  const permissions = useUserStore((s) => s.permissions)

  if (permissions === null) return <ActivationViewMainSkeleton />

  const isAdmin =
    permissions.includes(PERMISSION_ALL_WILDCARD) ||
    permissions.includes(PERMISSIONS.CustomerActivation.InternalAdmin)

  if (isAdmin) return <ActivationViewAdmin />

  const isOtherRole = OTHER_KEYS.some((k) => permissions.includes(k))
  if (isOtherRole) return <ActivationViewOther />

  return <ForbiddenView />
}
