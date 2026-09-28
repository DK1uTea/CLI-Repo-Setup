'use client'

import { CalendarDaysIcon, PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/shared/components/ui/button'
import { useUserStore, useDateFormat } from '@/shared/stores/use-user-store'
import { ComponentGuard } from '@/shared/components/common/component-guard'
import { WelcomeGreeting } from '@/shared/components/common/welcome-greeting'
import { PERMISSIONS } from '@/shared/constants/permissions'

import DashboardEvents from './dashboard-events'
import DashboardCharts from './dashboard-charts'

export default function DashboardMain() {
  const t = useTranslations('dashboard')
  const user = useUserStore((s) => s.user)
  const permissions = useUserStore((s) => s.permissions)
  const dateFormat = useDateFormat()

  return (
    <div className="flex flex-col gap-6">
      <WelcomeGreeting
        firstName={user.firstName}
        lastName={user.lastName}
        lastLogin={user.lastLoginAt ?? null}
        dateFormat={dateFormat}
      />

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <ComponentGuard requiredKeys={[PERMISSIONS.Event.Management, PERMISSIONS.Event.Create]}>
          <Button href="/events/new-event">
            <PlusIcon className="size-4.5" />
            {t('createEvent')}
          </Button>
        </ComponentGuard>
        <ComponentGuard
          requiredKeys={[
            PERMISSIONS.Event.Management,
            PERMISSIONS.Event.List.Active,
            PERMISSIONS.Event.List.Draft,
          ]}
        >
          <Button variant="outline-primary" href="/events?tab=calendar">
            <CalendarDaysIcon className="size-4.5" />
            {t('goToCalendar')}
          </Button>
        </ComponentGuard>
      </div>

      {permissions !== null && (
        <ComponentGuard
          requiredKeys={[PERMISSIONS.Event.Management, PERMISSIONS.Event.List.Active]}
        >
          <DashboardEvents />
        </ComponentGuard>
      )}
      <div className="mt-5">
        <DashboardCharts />
      </div>
    </div>
  )
}
