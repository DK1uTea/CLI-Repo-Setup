'use client';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

function CarouselSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row-reverse lg:w-1/2">
      <Skeleton className="aspect-square min-w-0 flex-1 rounded-lg" />
      <div className="flex gap-2 overflow-hidden sm:w-24 sm:flex-col sm:overflow-visible">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="aspect-square w-24 shrink-0 rounded-xl sm:w-full" />
        ))}
      </div>
    </div>
  );
}

function InfoSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6 lg:w-1/2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-7 w-4/5 rounded" />
          <Skeleton className="h-7 w-3/5 rounded" />
        </div>
        <Skeleton className="h-9 w-36 shrink-0 rounded-lg" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
      </div>
      <div>
        <Skeleton className="h-3 w-36 rounded" />
        <Skeleton className="mt-1 h-8 w-28 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-13.5 rounded-detail-field" />
        <Skeleton className="h-13.5 rounded-detail-field" />
      </div>
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-32 rounded" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-6">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventProductDetailMainSkeleton() {
  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-8 p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <CarouselSkeleton />
          <InfoSkeleton />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-4 border-b border-border">
            <Skeleton className="h-10 w-28 rounded-t" />
            <Skeleton className="h-10 w-28 rounded-t" />
          </div>
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}
