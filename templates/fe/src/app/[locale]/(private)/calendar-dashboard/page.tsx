import CalendarDashboardMain from '@/features/calendar/(components)/calendar-dashboard-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const REQUIRED_KEYS = [PERMISSIONS.Calendar.Management, PERMISSIONS.Calendar.List]

export default function CalendarDashboardPage() {
  return (
    <RouteGuard requiredKeys={REQUIRED_KEYS}>
      <CalendarDashboardMain />
    </RouteGuard>
  )
}
