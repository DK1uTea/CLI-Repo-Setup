import ActivationDetailPage from '@/features/cam/activation-detail/(components)/activation-detail-page'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.CustomerActivation.InternalAdmin]

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ backTo?: string }>
}

export default async function CustomerActivationDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { backTo } = await searchParams

  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <ActivationDetailPage activationId={id} backTo={backTo} />
    </RouteGuard>
  )
}
