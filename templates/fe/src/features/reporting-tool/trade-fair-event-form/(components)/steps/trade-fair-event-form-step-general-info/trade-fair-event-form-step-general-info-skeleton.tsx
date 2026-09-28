import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

const FieldSkeleton = ({ className = "" }: { className?: string }) => (
  <Skeleton className={`h-11 w-full rounded-lg ${className}`} />
);

const CardHeaderSkeleton = () => (
  <CardHeader>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  </CardHeader>
);

const TradeFairEventFormStepGeneralInfoSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeaderSkeleton />
        <CardContent className="flex flex-col gap-4">
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <Skeleton className="h-28 w-full rounded-lg" />
          <FieldSkeleton />
        </CardContent>
      </Card>

      <Card>
        <CardHeaderSkeleton />
        <CardContent>
          <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="h-4 w-52 max-w-full" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeaderSkeleton />
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <FieldSkeleton />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <FieldSkeleton />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeaderSkeleton />
        <CardContent className="flex flex-col gap-4">
          <FieldSkeleton />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeFairEventFormStepGeneralInfoSkeleton;
