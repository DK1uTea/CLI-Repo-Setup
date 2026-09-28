import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

const EventAnalyticsLeadsTimelineSkeleton = () => {
  return (
    <Card className="rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-8 w-32" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-80 w-full" />
        <div className="flex gap-10">
          <Skeleton className="h-16 w-28" />
          <Skeleton className="h-16 w-28" />
        </div>
      </CardContent>
    </Card>
  );
};

export default EventAnalyticsLeadsTimelineSkeleton;
