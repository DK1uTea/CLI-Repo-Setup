import TradeFairEventDetailMain from '@/features/reporting-tool/event-detail/(components)/trade-fair-event-detail-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.ReportingTool.Management, PERMISSIONS.ReportingTool.Manager]

export default function ReportingToolEventDetailPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <TradeFairEventDetailMain />
    </RouteGuard>
  )
}
