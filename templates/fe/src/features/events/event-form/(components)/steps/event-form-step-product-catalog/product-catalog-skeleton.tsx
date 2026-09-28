import { Skeleton } from '@/shared/components/ui/skeleton';
import { ProductCatalogGridSkeleton } from './product-catalog-grid-skeleton';

export function ProductCatalogSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-13.5 w-full" />
        <Skeleton className="h-13.5 w-full" />
        <Skeleton className="h-13.5 w-full" />
      </div>

      <ProductCatalogGridSkeleton />
    </div>
  );
}
