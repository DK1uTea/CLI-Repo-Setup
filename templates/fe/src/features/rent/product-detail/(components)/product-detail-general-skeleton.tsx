import { Skeleton } from "@/shared/components/ui/skeleton";

const ProductDetailGeneralSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex flex-col gap-6 sm:flex-row-reverse lg:w-1/2">
        <Skeleton className="aspect-7/6 min-w-0 flex-1 rounded-lg sm:mx-4" />
        <div className="flex gap-2 overflow-hidden sm:w-24 sm:flex-col sm:overflow-visible">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-24 shrink-0 rounded-xl sm:w-full" />
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-7 lg:w-1/2">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-7 w-4/5 max-w-96" />
            <Skeleton className="h-7 w-3/5 max-w-72" />
          </div>
          <Skeleton className="h-10.5 w-36 shrink-0" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="grid w-full max-w-120 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-full max-w-120" />
          <Skeleton className="h-5 w-4/5 max-w-96" />
        </div>
      </div>
    </div>
  );
}

export default ProductDetailGeneralSkeleton;
