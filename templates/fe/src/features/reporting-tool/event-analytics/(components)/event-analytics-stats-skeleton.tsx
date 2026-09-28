import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

const EventAnalyticsStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="min-h-40 rounded-3xl">
          <CardContent className="flex h-full flex-col justify-between gap-10">
            <div className="flex items-start justify-between gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-5 rounded" />
            </div>

            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default EventAnalyticsStatsSkeleton;
