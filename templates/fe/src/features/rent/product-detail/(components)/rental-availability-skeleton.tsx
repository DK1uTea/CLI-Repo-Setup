import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

const SKELETON_WEEKS = 5;

const RentalAvailabilitySkeleton = () => {
  return (
    <div className="py-4">
      <Card className="w-full">
        <CardHeader className="flex">
          <Skeleton className="h-10 w-56 max-w-full" />
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto pb-1">
            <div className="min-w-[32rem] overflow-hidden rounded-lg border border-border sm:min-w-0">
              <div className="grid grid-cols-7 border-b border-border bg-muted/40">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="px-2 py-3">
                    <Skeleton className="mx-auto h-3 w-8" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col divide-y divide-border">
                {Array.from({ length: SKELETON_WEEKS }).map((_, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 divide-x divide-border">
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                      <div key={dayIndex} className="flex min-h-20 flex-col p-2 sm:aspect-[1.35] sm:min-h-0">
                        <Skeleton className="ms-auto h-3 w-4" />
                        <div className="flex flex-1 flex-col items-center justify-center gap-2">
                          <Skeleton className="h-6 w-8" />
                          <Skeleton className="h-3 w-14" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalAvailabilitySkeleton;
