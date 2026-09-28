"use client"

import { Skeleton } from '@/shared/components/ui/skeleton'

const baseWidths = ['w-16', 'w-20', 'w-24', 'w-28', 'w-32', 'w-36']
const widths = Array.from({ length: 16 }, (_, i) => baseWidths[i % baseWidths.length])

export default function RentalCategoriesSkeleton() {
  return (
    <div className="flex gap-4 flex-wrap" aria-hidden>
      <div className="flex gap-4 flex-wrap">
        {widths.map((w, i) => (
          <Skeleton key={i} className={`h-10 rounded-xl ${w}`} />
        ))}
        <Skeleton className="h-10 rounded-xl w-28" />
      </div>
    </div>
  )
}
