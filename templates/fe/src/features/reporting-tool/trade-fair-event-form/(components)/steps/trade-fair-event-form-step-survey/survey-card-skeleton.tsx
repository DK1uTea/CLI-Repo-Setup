import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent } from "@/shared/components/ui/card";

const SurveyItemSkeleton = () => {
  return (
    <Card className="py-5 rounded-4xl">
      <CardContent>
        <div className="flex items-center gap-3">
          <Skeleton className="size-5 shrink-0 rounded-full" />
          <div className="flex grow flex-col gap-2">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="size-8 shrink-0 rounded-button" />
        </div>
      </CardContent>
    </Card>
  );
};

const SurveyCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <SurveyItemSkeleton />
      <SurveyItemSkeleton />
      <SurveyItemSkeleton />
    </div>
  );
};

export default SurveyCardSkeleton;
