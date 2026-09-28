import { Skeleton } from "@/shared/components/ui/skeleton";

export function DetailDrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-5 py-4 overflow-y-auto h-full _custom-scroll">
      {/* Image Carousel Skeleton */}
      <Skeleton className="w-full h-80 rounded-lg" />

      {/* Title & Details Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="w-2/3 h-6 rounded" />
        <Skeleton className="w-1/2 h-4 rounded" />
        <Skeleton className="w-24 h-6 rounded-full mt-1" />
      </div>

      {/* Participant List Skeleton */}
      <div className="flex flex-col gap-2 mt-2">
        <Skeleton className="w-1/3 h-4 rounded" />
        <div className="flex gap-2 items-center">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="w-12 h-4 rounded" />
        </div>
      </div>

      <hr className="border-border my-2" />

      {/* Tabs Skeleton */}
      <div className="flex gap-4">
        <Skeleton className="w-20 h-8 rounded" />
        <Skeleton className="w-32 h-8 rounded" />
        <Skeleton className="w-24 h-8 rounded" />
      </div>

      {/* Tab Content Skeleton */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="w-1/4 h-3 rounded" />
          <Skeleton className="w-3/4 h-5 rounded" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="w-1/4 h-3 rounded" />
          <Skeleton className="w-2/3 h-5 rounded" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="w-1/4 h-3 rounded" />
          <Skeleton className="w-1/2 h-5 rounded" />
        </div>
      </div>
    </div>
  );
}

export default DetailDrawerSkeleton;
