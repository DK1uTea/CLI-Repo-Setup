import { EventFormBody } from '@/features/events/event-form/(components)/event-form-body'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.Event.Management, PERMISSIONS.Event.Update]

export default function UpdateEventPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <EventFormBody mode="update" />
    </RouteGuard>
  )
}
