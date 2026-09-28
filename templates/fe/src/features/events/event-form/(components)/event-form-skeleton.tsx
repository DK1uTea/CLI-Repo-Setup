import { Skeleton } from '@/shared/components/ui/skeleton';
import { Card, CardContent } from '@/shared/components/ui/card';

function SidebarSkeleton() {
  return (
    <>
      {/* Mobile compact bar skeleton */}
      <div className="lg:hidden sticky top-0 z-20 -mx-6 px-6 bg-background pb-3 border-b border-border">
        <Skeleton className="h-4 w-28 mt-3 mb-3" />
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="size-8 rounded-full" />
          ))}
        </div>
      </div>

      {/* Desktop sidebar skeleton */}
      <aside className="no-scroll hidden lg:flex sticky top-20 h-[calc(100dvh-64px)] w-1/4 shrink-0 flex-col overflow-y-auto _custom-scroll bg-background px-1 pb-28">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <Skeleton className="h-6 w-36" />
        </div>

        <Card className="mt-7 shrink-0">
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="mt-11.5">
              <Skeleton className="h-9 w-full rounded-full" />
            </div>
          </CardContent>
        </Card>

        <div className="mt-9">
          <Skeleton className="h-4 w-12 mb-3" />
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="py-3.5">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Skeleton className="size-6 rounded-full shrink-0" />
                    <Skeleton className={`h-4 ${i === 0 ? 'w-28' : 'w-20'}`} />
                  </div>
                  {i === 0 && (
                    <Skeleton className="ml-12 mr-3 h-3 w-4/5 mt-1" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

function MainContentSkeleton() {
  return (
    <div className="flex-1 min-w-0 space-y-4">
      {/* Section heading */}
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Event title input */}
      <Skeleton className="h-12 w-full rounded-md" />

      {/* Event mode select */}
      <Skeleton className="h-12 w-full rounded-md" />

      {/* Target audience select + helper */}
      <div className="space-y-1.5">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-3.5 w-52" />
      </div>

      {/* Event ID + Event type row */}
      <div className="flex gap-4">
        <Skeleton className="h-12 flex-1 rounded-md" />
        <Skeleton className="h-12 flex-1 rounded-md" />
      </div>

      {/* Do not publish checkbox */}
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-4 rounded-full" />
      </div>

      {/* Description textarea */}
      <div className="space-y-1">
        <div className="flex justify-end">
          <Skeleton className="h-3.5 w-12" />
        </div>
        <Skeleton className="h-32 w-full rounded-md" />
      </div>

      {/* Participation select */}
      <Skeleton className="h-12 w-full rounded-md" />

      {/* Link to event input */}
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  );
}

export function EventFormSkeleton() {
  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      <SidebarSkeleton />
      <MainContentSkeleton />
    </div>
  );
}
