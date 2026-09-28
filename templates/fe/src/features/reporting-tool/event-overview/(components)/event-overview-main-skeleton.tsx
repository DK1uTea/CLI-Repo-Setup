import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import EventOverviewActivitiesSkeleton from "./event-overview-activities-skeleton";
import EventOverviewStatsSkeleton from "./event-overview-stats-skeleton";

const EventOverviewMainSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <Card>
        <CardContent className="gap-0">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Skeleton className="h-60 w-full rounded-2xl sm:h-40 sm:w-56 sm:shrink-0 lg:w-64" />
            <div className="flex flex-col gap-4 sm:grow lg:flex-row lg:items-end">
              <div className="flex flex-col gap-3 sm:grow">
                <Skeleton className="h-7 w-3/4 max-w-96" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-44" />
                </div>
                <div className="flex min-h-10 flex-col gap-2">
                  <Skeleton className="h-4 w-full max-w-125" />
                  <Skeleton className="h-4 w-4/5 max-w-lg" />
                </div>
              </div>
              <div className="flex flex-col gap-2 lg:flex-row lg:self-end">
                <Skeleton className="h-10 w-28 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <EventOverviewStatsSkeleton />
      <EventOverviewActivitiesSkeleton />
    </div>
  );
}

export default EventOverviewMainSkeleton;
