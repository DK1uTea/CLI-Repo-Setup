import { Skeleton } from '@/shared/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

export function HelpingHandsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-13.5 w-full" />
        <div className="md:col-span-1">
          <Skeleton className="h-13.5 w-full" />
        </div>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
