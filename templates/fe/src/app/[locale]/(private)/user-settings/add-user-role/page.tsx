import AddUserRoleMain from '@/features/user-settings/add-user-role/add-user-role'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions'

export default function page() {
  return (
    <RouteGuard requiredKeys={PERMISSION_ALL_WILDCARD}>
      <AddUserRoleMain />
    </RouteGuard>
  )
}
