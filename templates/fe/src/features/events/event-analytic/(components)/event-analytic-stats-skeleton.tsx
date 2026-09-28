import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

const STAT_SKELETON_ITEMS = ['completed', 'incomplete', 'total']

const EventAnalyticStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {STAT_SKELETON_ITEMS.map((item) => (
        <Card key={item} className="min-h-40 px-4 py-0">
          <CardContent className="flex h-full flex-col items-center justify-center gap-5 px-0">
            <div className="flex h-12 items-center">
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-12 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default EventAnalyticStatsSkeleton
