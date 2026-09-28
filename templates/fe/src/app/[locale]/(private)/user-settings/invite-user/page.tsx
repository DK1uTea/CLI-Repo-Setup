import InviteUserMain from '@/features/user-settings/invite-user/invite-user'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions'

export default function page() {
  return (
    <RouteGuard requiredKeys={PERMISSION_ALL_WILDCARD}>
      <InviteUserMain />
    </RouteGuard>
  )
}
