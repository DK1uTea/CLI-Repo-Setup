import EditUserRoleMain from '@/features/user-settings/edit-user-role/edit-user-role'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions'

export default async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <RouteGuard requiredKeys={PERMISSION_ALL_WILDCARD}>
      <EditUserRoleMain id={id} />
    </RouteGuard>
  )
}
