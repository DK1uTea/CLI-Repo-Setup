import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

const TradeFairSurveyFormStepSurveySkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Survey Name Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full rounded-md" />
        </CardContent>
      </Card>

      {/* Survey Steps Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Accordion items skeletons */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, stepIdx) => (
            <Card key={stepIdx} className="overflow-hidden border border-border">
              <div className="flex items-center justify-between p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4" />
                  <Skeleton className="h-5 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="size-8 rounded-md" />
                  <Skeleton className="size-8 rounded-md" />
                </div>
              </div>
              <div className="p-4 flex flex-col gap-4 border-t border-border bg-background">
                {/* Group card skeleton */}
                <Card className="border border-dashed border-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-5 w-36" />
                    <div className="flex gap-2">
                      <Skeleton className="size-8 rounded-md" />
                      <Skeleton className="size-8 rounded-md" />
                    </div>
                  </div>
                  {/* Questions */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/10">
                      <div className="flex items-center gap-3 w-full">
                        <Skeleton className="size-4 shrink-0" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-16 ml-auto shrink-0" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/10">
                      <div className="flex items-center gap-3 w-full">
                        <Skeleton className="size-4 shrink-0" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-16 ml-auto shrink-0" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Step Button Skeleton */}
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
};

export default TradeFairSurveyFormStepSurveySkeleton;
