import {
  Card,
  CardContent,
  CardHeader,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

export default function DashboardMainSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Event cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <EventCardSkeleton />
        <EventCardSkeleton />
      </div>

      {/* Chart cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </div>
  )
}

function EventCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  )
}
