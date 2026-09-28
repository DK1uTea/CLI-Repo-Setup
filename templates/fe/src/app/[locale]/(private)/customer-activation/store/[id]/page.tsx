import { StoreAdminDetailPage } from '@/features/cam/activation-view/(components)/store/store-admin-detail-page'

type Props = { params: Promise<{ id: string }> }

export default async function CustomerActivationStoreDetailPage({ params }: Props) {
  const { id } = await params
  return <StoreAdminDetailPage storeId={id} />
}
