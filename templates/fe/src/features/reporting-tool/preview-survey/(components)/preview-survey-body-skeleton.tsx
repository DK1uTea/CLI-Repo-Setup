'use client';

import { Skeleton } from "@/shared/components/ui/skeleton";

export function PreviewSurveyBodySkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-[32px] p-7 bg-card">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 animate-pulse" />
            <Skeleton className="h-11 w-full rounded-input! animate-pulse" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3 animate-pulse" />
            <Skeleton className="h-11 w-full rounded-input! animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
