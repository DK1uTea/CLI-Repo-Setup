import { cn } from '@/lib/utils';
import { Skeleton } from '@/shared/components/ui/skeleton';

type Props = { compact?: boolean };

export function EventFormSidebarInfoSkeleton({ compact = false }: Props) {
  return (
    <div
      aria-hidden="true"
      data-sidebar-info-skeleton
      className="flex flex-col gap-2"
    >
      <Skeleton className="h-5 w-16" />
      <Skeleton className={cn('h-6', compact ? 'w-36' : 'w-3/4')} />
      <Skeleton className="h-4 w-40" />
      {!compact && <Skeleton className="h-4 w-32" />}
    </div>
  );
}
