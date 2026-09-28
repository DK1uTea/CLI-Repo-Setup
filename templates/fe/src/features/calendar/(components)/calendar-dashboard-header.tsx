'use client'

import { WelcomeGreeting } from "@/shared/components/common/welcome-greeting"
import { Button } from "@/shared/components/ui/button"
import { useDateFormat, useUserStore, useHasPermission } from "@/shared/stores/use-user-store"
import { PERMISSIONS } from "@/shared/constants/permissions"
import { PlusIcon } from "lucide-react"
import { useTranslations } from "next-intl"

const CalendarDashboardHeader = () => {
  const td = useTranslations('dashboard')
  const user = useUserStore((s) => s.user)
  const dateFormat = useDateFormat()
  const canCreateEvent = useHasPermission(PERMISSIONS.Calendar.Create)

  return (
    <div className="flex flex-col gap-6">
      <WelcomeGreeting
        firstName={user.firstName}
        lastName={user.lastName}
        lastLogin={user.lastLoginAt ?? null}
        dateFormat={dateFormat}
      />
      {canCreateEvent && (
        <Button
          className="self-start mt-4"
          href="/calendar-dashboard/new-calendar-event">
          <PlusIcon className="size-4.5" />
          {td('createEvent')}
        </Button>
      )}
    </div>
  );
}

export default CalendarDashboardHeader;