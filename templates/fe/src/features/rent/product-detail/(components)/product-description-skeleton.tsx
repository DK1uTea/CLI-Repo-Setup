import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";

const ProductDescriptionSkeleton = () => {
  return (
    <div aria-hidden="true" className="py-4">
      <Card className="w-full max-w-125">
        <CardContent>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex justify-between gap-6">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Separator />
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="size-4 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                  {index === 0 && <Separator />}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductDescriptionSkeleton;
