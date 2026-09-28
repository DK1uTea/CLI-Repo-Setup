import { Skeleton } from '@/shared/components/ui/skeleton';
import { Card, CardContent } from '@/shared/components/ui/card';

export default function FeedbackDrawerSkeleton() {
  return (
    <div className="flex-1 min-h-0 px-4 py-4 flex flex-col gap-3">
      <Skeleton className="h-6 w-36 rounded" />
      <Card>
        <CardContent className="flex flex-col gap-5 p-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-28 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 w-16 rounded-md" />
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 py-1">
              <Skeleton className="size-4 rounded shrink-0" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
            <div className="flex items-center gap-2 py-1">
              <Skeleton className="size-4 rounded shrink-0" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
            <div className="flex items-center gap-2 py-1">
              <Skeleton className="size-4 rounded shrink-0" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </div>

          <Skeleton className="h-10 w-full rounded-md mt-1" />

          <div className="flex flex-col gap-3 mt-2">
            <Skeleton className="h-5 w-32 rounded" />
            <div className="flex gap-3 py-1">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
            <div className="flex gap-3 py-1">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-10 w-4/5 rounded-lg" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
