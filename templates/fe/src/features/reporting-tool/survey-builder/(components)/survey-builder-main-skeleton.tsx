import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import SurveyItemCardSkeleton from "./survey-item-card-skeleton";

const SurveyBuilderMainSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <Skeleton className="h-40 w-full" />
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-5 w-64 max-w-full" />
        </CardHeader>
        <CardContent className="gap-5">
          <Skeleton className="h-10 w-full" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-32" />
            <SurveyItemCardSkeleton showUsers />
            <SurveyItemCardSkeleton showUsers />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-36" />
            <SurveyItemCardSkeleton />
            <SurveyItemCardSkeleton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyBuilderMainSkeleton;
