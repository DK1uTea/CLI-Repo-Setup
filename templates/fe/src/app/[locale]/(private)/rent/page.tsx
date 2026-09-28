import RentMain from '@/features/rent/(components)/rent-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.Event.Management, PERMISSIONS.Event.Product.List]

export default function RentPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <RentMain />
    </RouteGuard>
  )
}
