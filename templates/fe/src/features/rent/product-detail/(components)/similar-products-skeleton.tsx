import { Skeleton } from "@/shared/components/ui/skeleton";

const skeletonCardCount = 5;

const SimilarProductsSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row items-center justify-between gap-3">
        <Skeleton className="size-10.5 rounded-full md:hidden" />
        <Skeleton className="mx-auto h-7 w-44 md:mx-0" />
        <div className="flex justify-end gap-3 md:justify-center">
          <Skeleton className="hidden size-10.5 rounded-full md:block" />
          <Skeleton className="size-10.5 rounded-full" />
        </div>
      </div>

      <div className="flex w-full gap-4 overflow-hidden">
        {Array.from({ length: skeletonCardCount }).map((_, index) => (
          <div
            key={index}
            className="relative flex h-full shrink-0 basis-[84%] flex-col overflow-hidden rounded-[18px] border border-border bg-card p-0 shadow-sm sm:basis-[44%] md:basis-[28%] lg:basis-[21%] xl:basis-[18%]"
          >
            <div className="flex h-56 w-full items-center justify-center bg-card">
              <Skeleton className="h-full w-full rounded-none" />
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>

              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-5 w-28" />

              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>

              <Skeleton className="mt-auto h-10 w-full rounded-button!" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SimilarProductsSkeleton;
