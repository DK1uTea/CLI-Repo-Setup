import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

const OrderDetailItemsSkeleton = () => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex grow flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-44" />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-3">
                <CardContent className="p-0">
                  <div className="flex gap-4">
                    <Skeleton className="size-[74px] shrink-0 rounded-md" />
                    <div className="flex min-w-0 grow flex-col gap-2">
                      <Skeleton className="h-4 w-4/5 max-w-80" />
                      <Skeleton className="h-5 w-24 rounded-lg" />
                    </div>
                    <Skeleton className="hidden h-4 w-20 shrink-0 sm:block" />
                    <Skeleton className="h-4 w-16 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const OrderDetailSummarySkeleton = () => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex justify-between gap-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const CustomerInformationSkeleton = () => {
  return (
    <Card className="w-full self-start p-3 md:p-5 lg:w-96">
      <CardContent className="p-0">
        <div className="flex flex-col gap-3.5">
          <Skeleton className="h-5 w-44" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4/5" />
              {index === 2 && (
                <>
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-4 w-2/5" />
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const OrderDetailSkeleton = () => {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <div className="flex flex-col gap-5 lg:grow">
        <OrderDetailItemsSkeleton />
        <OrderDetailSummarySkeleton />
      </div>
      <CustomerInformationSkeleton />
    </div>
  );
}

export default OrderDetailSkeleton;
