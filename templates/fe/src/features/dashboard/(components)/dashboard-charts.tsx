'use client'

import { EllipsisIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { parseAsBoolean, useQueryState } from 'nuqs'

import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { useEventAnalyticsTurnover } from '../(hooks)/use-event-analytics-turnover'

import { DashboardBarChart } from './dashboard-bar-chart'
import { DashboardDonutChart } from './dashboard-donut-chart'

export default function DashboardCharts() {
  const t = useTranslations('dashboard')
  const [includeFuture, setIncludeFuture] = useQueryState(
    'include-future',
    parseAsBoolean.withDefault(false),
  )
  const { data: turnover, isLoading } = useEventAnalyticsTurnover({ includeFuture })

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <MetricsCard title={t('metrics')}>
        {isLoading ? <ChartSkeleton /> : <DashboardBarChart months={turnover?.months ?? []} />}
      </MetricsCard>

      <MetricsCard title={t('metrics')}>
        <DashboardDonutChart
          totalTurnover={turnover?.totalTurnover ?? 0}
          includeFuture={includeFuture}
          onIncludeFutureChange={setIncludeFuture}
          isLoading={isLoading}
        />
      </MetricsCard>
    </div>
  )
}

function ChartSkeleton() {
  return <Skeleton className="h-88.75 w-full rounded-xl" />
}

type MetricsCardProps = {
  title: string
  children: React.ReactNode
}

function MetricsCard({ title, children }: MetricsCardProps) {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={tCommon('moreOptions')}>
                <EllipsisIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t('year')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
