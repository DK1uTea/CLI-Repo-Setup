import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import ActivitySkeleton from "./activity-skeleton";

const EventOverviewActivitiesSkeleton = () => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>

          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, index) => (
              <ActivitySkeleton key={index} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EventOverviewActivitiesSkeleton;
