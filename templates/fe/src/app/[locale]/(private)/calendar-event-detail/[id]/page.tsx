import { CalendarEventDetailMain } from '@/features/calendar/event-calendar-detail/(components)/calendar-event-detail-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.Calendar.Management, PERMISSIONS.Calendar.List]

type Props = { params: Promise<{ id: string }> }

export default async function CalendarEventDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <CalendarEventDetailMain id={id} />
    </RouteGuard>
  )
}
