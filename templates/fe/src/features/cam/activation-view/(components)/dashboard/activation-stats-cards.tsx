'use client'

import { useTranslations } from 'next-intl'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useActivationAdminStats } from '../../(hooks)/use-activation-admin-stats'

export function ActivationStatsCards() {
  const t = useTranslations('activationView')
  const { stats, isLoading } = useActivationAdminStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    )
  }

  const cards = [
    { label: t('dashboard.statsNewSubmissions'), value: stats?.ready ?? 0 },
    { label: t('dashboard.statsUnderReview'), value: stats?.review ?? 0 },
    { label: t('dashboard.statsNeedsClarification'), value: stats?.clarification ?? 0 },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground">{card.label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
