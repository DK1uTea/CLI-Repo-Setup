import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

type Props = {
  showUsers?: boolean;
}

const SurveyItemCardSkeleton = ({ showUsers = false }: Props) => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex grow flex-col gap-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-24" />
            </div>
            {showUsers && <Skeleton className="hidden h-10 w-24 lg:block" />}
            <Skeleton className="hidden h-10 w-32 lg:block" />
            <Skeleton className="size-10" />
          </div>
          <Skeleton className="h-10 w-full lg:hidden" />
        </div>
      </CardContent>
    </Card>
  );
}

export default SurveyItemCardSkeleton;
