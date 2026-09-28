'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';

const CARD_COUNT = 8;

export default function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: CARD_COUNT }).map((_, index) => (
        <div
          key={index}
          className="relative flex h-full flex-col overflow-hidden rounded-[18px] border border-border bg-card p-0 shadow-sm"
        >
          <div className="flex h-78 w-full items-center justify-center bg-muted">
            <Skeleton className="h-full w-full rounded-none" />
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="mt-2 flex h-10 flex-col gap-1">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>

            <Skeleton className="h-5 w-28" />

            <div className="mt-2 flex flex-col gap-0.5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
