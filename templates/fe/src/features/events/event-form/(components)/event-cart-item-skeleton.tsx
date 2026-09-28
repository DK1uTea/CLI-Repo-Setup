import { Skeleton } from '@/shared/components/ui/skeleton';

export function EventCartItemSkeleton() {
  return (
    <div className="flex w-full shrink-0 gap-3 rounded-[18px] border border-border bg-background p-4">
      <Skeleton className="size-29 shrink-0 rounded-lg" />
      <div className="flex min-h-29 flex-1 flex-col justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/5" />
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-24 rounded-button" />
        </div>
      </div>
    </div>
  );
}
