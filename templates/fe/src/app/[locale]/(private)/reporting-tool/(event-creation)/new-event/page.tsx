import TradeFairEventFormBody from '@/features/reporting-tool/trade-fair-event-form/(components)/trade-fair-event-form-body'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.ReportingTool.Management, PERMISSIONS.ReportingTool.Manager]

export default function NewTradeFairEventPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <TradeFairEventFormBody mode="create" />
    </RouteGuard>
  )
}
