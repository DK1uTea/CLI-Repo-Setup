import SelectEventMain from '@/features/reporting-tool/select-event/(components)/select-event-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.ReportingTool.Management, PERMISSIONS.ReportingTool.Manager]

export default function ReportingToolSelectEventPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <SelectEventMain />
    </RouteGuard>
  )
}
