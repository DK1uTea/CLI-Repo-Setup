import TradeFairLeadDetailMain from '@/features/reporting-tool/lead-detail/(components)/trade-fair-lead-detail-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.ReportingTool.Management, PERMISSIONS.ReportingTool.Manager]

export default function TradeFairLeadDetailPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <TradeFairLeadDetailMain />
    </RouteGuard>
  )
}
