import ReportingToolMain from '@/features/reporting-tool/(components)/reporting-tool-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { redirect } from '@/i18n/navigation'

const REQUIRED_KEYS = [PERMISSIONS.ReportingTool.Management, PERMISSIONS.ReportingTool.Manager]

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ eventId?: string }>
}

export default async function page(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const eventId = searchParams.eventId

  if (!eventId) {
    redirect({ href: '/reporting-tool/select-event', locale: params.locale as 'en' | 'de' })
  }

  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <ReportingToolMain />
    </RouteGuard>
  )
}
