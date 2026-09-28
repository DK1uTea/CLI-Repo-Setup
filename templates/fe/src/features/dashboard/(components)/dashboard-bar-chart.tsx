'use client'

import { useTranslations } from 'next-intl'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { dayjs } from '@/lib/date-utils'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/components/ui/chart'

type DashboardBarChartProps = {
  months: Array<{
    label: string
    total: number
  }>
}

export function DashboardBarChart({ months }: DashboardBarChartProps) {
  const t = useTranslations('dashboard')
  const chartData = months.map((month) => ({
    month: dayjs.utc(month.label, 'MM-YYYY', true).locale('en').format('MMM'),
    value: month.total,
  }))
  const allTotalsAreZero = chartData.every((item) => item.value === 0)
  const zeroValueTicks = Array.from({ length: 11 }, (_, index) => index * 100)

  const chartConfig = {
    value: {
      label: t('events'),
      color: 'var(--primary)',
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-[355px] w-full">
      <BarChart data={chartData} barCategoryGap="20%" margin={{ top: 50, bottom: 50 }}>
        <CartesianGrid
          vertical={false}
          stroke="var(--border)"
          strokeDasharray="3 3"
          strokeOpacity={1}
        />
        <XAxis
          dataKey="month"
          interval={0}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--primary)' }}
        />
        <YAxis
          domain={allTotalsAreZero ? [0, 1000] : [0, 'auto']}
          ticks={allTotalsAreZero ? zeroValueTicks : undefined}
          interval={0}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--primary)' }}
          tickFormatter={(v: number) => `${v.toLocaleString('en-US')} €`}
          width={60}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideIndicator
              formatter={(value) => (
                <div className="flex min-w-32 flex-1 items-center justify-between gap-4">
                  <span className="text-muted-foreground">{t('events')}:</span>
                  <span className="font-mono font-medium text-foreground tabular-nums">
                    {`${Number(value).toLocaleString('de-DE')} €`}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          radius={0}
          maxBarSize={10}
        />
      </BarChart>
    </ChartContainer>
  )
}
