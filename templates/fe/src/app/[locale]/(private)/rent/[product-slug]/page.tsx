import ProductDetailMain from '@/features/rent/product-detail/(components)/product-detail-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.Event.Management, PERMISSIONS.Event.Product.Detail]

interface PageProps {
  params: Promise<{ 'product-slug': string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { 'product-slug': productSlug } = await params
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <ProductDetailMain slug={productSlug} />
    </RouteGuard>
  )
}
