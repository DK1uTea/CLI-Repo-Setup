import RecentActivityMain from '@/features/reporting-tool/recent-activity/(components)/recent-activity-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.ReportingTool.Management, PERMISSIONS.ReportingTool.Manager]

export default function TradeFairRecentActivityPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <RecentActivityMain />
    </RouteGuard>
  )
}
