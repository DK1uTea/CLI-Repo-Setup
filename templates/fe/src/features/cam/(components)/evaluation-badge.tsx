'use client'

import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'

type Props = {
  evaluation: {
    score: number
    maxScore: number
  } | null
}

export function EvaluationBadge({ evaluation }: Props) {
  const hasScore = evaluation !== null && evaluation.score !== undefined
  const score = evaluation?.score ?? 0
  const maxScore = evaluation?.maxScore ?? 27

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-[8px] px-2 py-0.5 text-xs h-auto font-semibold shadow-none border-transparent',
        hasScore
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
      )}
    >
      {score}/{maxScore}
    </Badge>
  )
}

export default EvaluationBadge
