import TradeFairSurveyFormBody from '@/features/reporting-tool/trade-fair-survey-form/(components)/trade-fair-survey-form-body'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.ReportingTool.Management, PERMISSIONS.ReportingTool.Manager]

export default function UpdateTradeFairSurveyPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <TradeFairSurveyFormBody mode="update" />
    </RouteGuard>
  )
}
