function SkeletonItem({ isLast }: { isLast: boolean }) {
  return (
    <>
      <div className="flex animate-pulse items-center gap-4 px-4 py-3 md:px-5 md:py-4">
        <div className="h-12.5 w-11 shrink-0 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/5 rounded bg-muted" />
          <div className="h-3 w-3/5 rounded bg-muted" />
        </div>
        <div className="flex shrink-0 gap-2">
          <div className="h-8 w-18 rounded bg-muted" />
        </div>
      </div>
      {!isLast && <div className="h-px bg-border" />}
    </>
  )
}

function SkeletonGroup() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-5 w-28 animate-pulse rounded bg-muted" />
      <div className="overflow-hidden rounded-lg border bg-card">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonItem key={i} isLast={i === 2} />
        ))}
      </div>
    </div>
  )
}

export function CalendarListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonGroup />
      <SkeletonGroup />
    </div>
  )
}
