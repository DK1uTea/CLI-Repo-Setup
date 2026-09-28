import OrderDetailMain from '@/features/rent/order-detail/(components)/order-detail-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.Event.Management]

export default function OrderDetailPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <OrderDetailMain />
    </RouteGuard>
  )
}
