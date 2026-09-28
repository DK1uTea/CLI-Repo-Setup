import { EventFormBody } from '@/features/events/event-form/(components)/event-form-body'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.Calendar.Management, PERMISSIONS.Calendar.Update]

export default function UpdateCalendarEventPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <EventFormBody mode="update" variant="calendar" />
    </RouteGuard>
  )
}
