import { Skeleton } from '@/shared/components/ui/skeleton';
import { Card, CardContent } from '@/shared/components/ui/card';

function SummaryBlockSkeleton({ rowsCount = 5 }: { rowsCount?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border text-sm">
      <table className="w-full">
        <tbody>
          {Array.from({ length: rowsCount }).map((_, i) => (
            <tr key={i} className="border-b last:border-b-0 border-border">
              <td className="w-52 shrink-0 border-r border-border px-6 py-3">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="px-6 py-3">
                <Skeleton className="h-4 w-48" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SummarySkeleton() {
  return (
    <Card>
      <CardContent className="space-y-10 p-6">
        {/* Event info block */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <SummaryBlockSkeleton rowsCount={6} />
        </div>

        {/* Logistics block */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <SummaryBlockSkeleton rowsCount={6} />
        </div>

        {/* Files & Documents block */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <SummaryBlockSkeleton rowsCount={4} />
        </div>

        {/* Products block */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-36" />
          {/* Cart items list skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-4">
                <Skeleton className="size-16 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-24 shrink-0" />
              </div>
            ))}
          </div>
          {/* Total Cost block */}
          <div className="mt-6 space-y-3">
            <Skeleton className="h-5 w-24" />
            <SummaryBlockSkeleton rowsCount={6} />
          </div>
        </div>

        {/* Location & Map block */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          {/* Map placeholder skeleton */}
          <Skeleton className="h-100 w-full rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}
