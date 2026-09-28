'use client';

import { Skeleton } from "@/shared/components/ui/skeleton";

export function PreviewSurveyFooterSkeleton() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full">
      <Skeleton className="h-12 w-full sm:w-1/2 rounded-button! animate-pulse" />
      <Skeleton className="h-12 w-full sm:w-1/2 rounded-button! animate-pulse" />
    </div>
  );
}
