import { Skeleton } from '@/shared/components/ui/skeleton'

const WEEKDAYS = Array.from({ length: 7 })
const CELLS = Array.from({ length: 35 })

export function EventCalendarSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((_, i) => (
          <div key={`h-${i}`} className="border-l px-2 py-2 first:border-l-0">
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {CELLS.map((_, i) => (
          <div
            key={i}
            className="flex min-h-26 flex-col gap-1.5 border-b border-l p-1.5 nth-[7n+1]:border-l-0"
          >
            <Skeleton className="size-5 self-start rounded-full" />
            {i % 4 === 0 && <Skeleton className="h-4 w-full rounded-full" />}
            {i % 3 === 0 && <Skeleton className="h-4 w-2/3 rounded-full" />}
          </div>
        ))}
      </div>
    </div>
  )
}
