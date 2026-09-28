import { EventProductDetailMain } from '@/features/events/product-detail/(components)/event-product-detail-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.Event.Management, PERMISSIONS.Event.Product.Detail]

export default function ProductDetailPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <EventProductDetailMain />
    </RouteGuard>
  )
}
