import { EventFormBody } from '@/features/events/event-form/(components)/event-form-body'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.Calendar.Management, PERMISSIONS.Calendar.Create]

export default function NewCalendarEventPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <EventFormBody mode="create" variant="calendar" />
    </RouteGuard>
  )
}
