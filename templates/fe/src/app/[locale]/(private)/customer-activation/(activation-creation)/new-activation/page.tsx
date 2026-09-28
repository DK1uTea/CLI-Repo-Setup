import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions'
import { ActivationFormMain } from '@/features/cam/activation-form/(components)/activation-form-main'

const REQUIRED_KEYS = [
  PERMISSION_ALL_WILDCARD,
  PERMISSIONS.CustomerActivation.InternalAdmin,
  PERMISSIONS.CustomerActivation.Sale,
]

export default function NewActivationPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <ActivationFormMain mode="create" />
    </RouteGuard>
  )
}
