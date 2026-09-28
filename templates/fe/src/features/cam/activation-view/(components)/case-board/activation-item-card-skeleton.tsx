import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";

const ActivationItemCardSkeleton = () => {
  return (
    <Card className="shrink-0 py-0">
      <CardContent className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2 min-h-8 -mb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="size-8 rounded-md" />
        </div>
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-[8px]" />
          <Skeleton className="h-5 w-20 rounded-[8px]" />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="size-7 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivationItemCardSkeleton;
