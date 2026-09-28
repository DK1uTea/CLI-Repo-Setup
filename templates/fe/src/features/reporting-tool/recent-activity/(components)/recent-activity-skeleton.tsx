import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import ActivitySkeleton from "./activity-skeleton";

const RecentActivitySkeleton = () => {
  return (
    <Card className="w-full">
      <CardContent className="space-y-6 py-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, index) => (
            <ActivitySkeleton key={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivitySkeleton;
