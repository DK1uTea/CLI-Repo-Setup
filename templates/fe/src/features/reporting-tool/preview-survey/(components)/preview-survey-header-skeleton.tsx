'use client';

import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function PreviewSurveyHeaderSkeleton() {
  return (
    <Card className="shrink-0 rounded-[24px]">
      <CardContent className="gap-0 py-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-16 rounded-full shrink-0 animate-pulse" />
          <div className="grow space-y-2">
            <Skeleton className="h-4 w-24 animate-pulse" />
            <Skeleton className="h-6 w-48 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
