import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

const EventAnalyticsLeadsByDaysSkeleton = () => {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-5 w-24 shrink-0" />
            <Skeleton className="h-5 flex-1 rounded-sm" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default EventAnalyticsLeadsByDaysSkeleton;
