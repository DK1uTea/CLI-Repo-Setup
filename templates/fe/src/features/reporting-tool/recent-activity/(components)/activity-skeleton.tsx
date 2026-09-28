import { Skeleton } from "@/shared/components/ui/skeleton";

const ActivitySkeleton = () => {
  return (
    <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      <Skeleton className="size-10 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3.5 w-1/4" />
      </div>
      <Skeleton className="h-3.5 w-10 shrink-0" />
    </div>
  );
};

export default ActivitySkeleton;
