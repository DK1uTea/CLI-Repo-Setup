import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

const EventsListSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardContent>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Skeleton className="h-48 w-full rounded-2xl sm:h-40 sm:w-56 sm:shrink-0 lg:w-64" />

                <div className="flex flex-col gap-4 sm:grow lg:flex-row lg:items-end">
                  <div className="flex flex-col gap-3 sm:grow">
                    <Skeleton className="h-7 w-3/4 max-w-96" />
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="size-4 rounded" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="size-4 rounded" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="size-4 rounded" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                    <div className="flex min-h-10 flex-col gap-2">
                      <Skeleton className="h-4 w-full max-w-160" />
                      <Skeleton className="h-4 w-4/5 max-w-lg" />
                    </div>
                  </div>

                  <Skeleton className="h-10 w-32 self-end rounded-md" />
                </div>
              </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default EventsListSkeleton;
