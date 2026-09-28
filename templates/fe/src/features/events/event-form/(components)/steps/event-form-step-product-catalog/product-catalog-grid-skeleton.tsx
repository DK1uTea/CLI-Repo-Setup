import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function ProductCatalogGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={index}
          className="flex h-full w-full flex-col overflow-hidden rounded-[18px] border border-border bg-card p-0 shadow-sm"
        >
          <div className="h-78 w-full bg-card">
            <Skeleton className="h-full w-full" />
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex h-10 flex-col gap-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-5 w-24" />
            <div className="mt-2 flex flex-col gap-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 px-4 pb-4 xl:flex-row xl:items-center">
            <Skeleton className="h-10 w-full xl:flex-1" />
            <Skeleton className="h-10 w-full xl:w-32" />
          </div>
        </Card>
      ))}
    </div>
  );
}
