'use client'

import { useTranslations } from 'next-intl'
import { Label, Pie, PieChart } from 'recharts'

import { Checkbox } from '@/shared/components/ui/checkbox'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useCurrency } from '@/shared/stores/use-user-store'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/components/ui/chart'

type DashboardDonutChartProps = {
  totalTurnover: number
  includeFuture: boolean
  isLoading?: boolean
  onIncludeFutureChange: (value: boolean | null) => void | Promise<URLSearchParams>
}

export function DashboardDonutChart({
  totalTurnover,
  includeFuture,
  isLoading = false,
  onIncludeFutureChange,
}: DashboardDonutChartProps) {
  const t = useTranslations('dashboard')
  const { symbol } = useCurrency()
  const turnover = Number.isFinite(Number(totalTurnover)) ? Number(totalTurnover) : 0
  const chartData = [
    {
      name: 'figure1',
      value: Math.max(turnover, 1),
      fill: turnover > 0 ? 'var(--color-figure1)' : 'var(--chart-empty)',
    },
  ]

  const chartConfig = {
    figure1: {
      label: t('salesFigure'),
      color: 'var(--primary)',
    },
  } satisfies ChartConfig

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <Skeleton className="h-[335px] w-full rounded-xl" />
      ) : (
        <ChartContainer config={chartConfig} className="h-[335px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={turnover > 0 ? '72%' : 0}
              outerRadius="82%"
              strokeWidth={0}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) - 20}
                          className="fill-muted-foreground text-xs"
                          fontSize={12}
                        >
                          {t('salesFigure')}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 10}
                          className="fill-foreground font-medium"
                          fontSize={22}
                        >
                          {`${turnover.toLocaleString('de-DE')} ${symbol}`}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={
                <ChartLegendContent
                  nameKey="name"
                  color="var(--color-figure1)"
                  className="font-medium"
                />
              }
            />
          </PieChart>
        </ChartContainer>
      )}

      <label className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={includeFuture}
          onCheckedChange={(checked) =>
            onIncludeFutureChange(checked === true ? true : null)
          }
        />
        {t('includeFutureEvents')}
      </label>
    </div>
  )
}
