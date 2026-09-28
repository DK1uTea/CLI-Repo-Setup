import { Skeleton } from '@/shared/components/ui/skeleton'

export function ActivationFormSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header & Step indicator card */}
      <div className="max-w-3xl mx-auto rounded-3xl border border-border bg-card overflow-hidden p-4 space-y-6 md:space-y-8">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-lg shrink-0" />
          <Skeleton className="h-7 w-64 rounded-md" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-4 w-12 rounded-md" />
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <Skeleton className="h-full w-1/2 rounded-full" />
          </div>
        </div>
      </div>

      {/* Body content card */}
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex gap-4 border-b border-border pb-2">
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
              <Skeleton className="h-4 w-64 rounded-md" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-4 w-40 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-10 -mx-6 border-y border-border bg-card">
        <div className="flex items-center justify-end gap-3 p-4">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
    </div>
  )
}
