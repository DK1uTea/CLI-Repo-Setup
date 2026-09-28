import TradeFairAnswerDetailMain from '@/features/reporting-tool/answer-detail/(components)/trade-fair-answer-detail-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.ReportingTool.Management, PERMISSIONS.ReportingTool.Manager]

export default function ReportingToolAnswerDetailPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <TradeFairAnswerDetailMain />
    </RouteGuard>
  )
}
