import { useTranslations } from 'next-intl'
import { TabsUrl } from '@/shared/components/ui/tabs-url'
import { TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import { EventListMain } from '@/features/events/event-list/(components)/event-list-main'
import { EventCalendarMain } from '@/features/events/event-calendar/(components)/event-calendar-main'
import EventListHeader from '@/features/events/event-list/(components)/event-list-header'
import EventAnalyticMain from '@/features/events/event-analytic/(components)/event-analytic-main'
import EventAddressMain from '@/features/events/event-address/(components)/event-address-main'
import { RouteGuard } from '@/shared/components/common/route-guard'
import { EVENT_ACCESS_KEYS } from '@/shared/constants/permissions'

export default function EventsPage() {
  const t = useTranslations('events')

  return (
    <RouteGuard requiredKeys={EVENT_ACCESS_KEYS}>
      <TabsUrl defaultValue="events">
        <EventListHeader />

        <TabsList variant="line">
          <TabsTrigger value="events">{t('tabs.event')}</TabsTrigger>
          <TabsTrigger value="calendar">{t('tabs.calendar')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('tabs.analytics')}</TabsTrigger>
          <TabsTrigger value="address">{t('tabs.address')}</TabsTrigger>
        </TabsList>
        <TabsContent value="events" className="mt-4">
          <EventListMain />
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <EventCalendarMain />
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <EventAnalyticMain />
        </TabsContent>
        <TabsContent value="address" className="mt-4">
          <EventAddressMain />
        </TabsContent>
      </TabsUrl>
    </RouteGuard>
  )
}
