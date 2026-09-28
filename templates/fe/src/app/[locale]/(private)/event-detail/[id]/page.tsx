import { EventDetailMain } from '@/features/events/event-detail/event/(components)/event-detail-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { EVENT_ACCESS_KEYS } from '@/shared/constants/permissions'

type Props = { params: Promise<{ id: string }> }

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <RouteGuard requiredKeys={EVENT_ACCESS_KEYS}>
      <EventDetailMain id={id} />
    </RouteGuard>
  )
}
