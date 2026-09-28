import { Skeleton } from '@/shared/components/ui/skeleton';
import ProductDescriptionSkeleton from './product-description-skeleton';

const ProductDetailTabsSkeleton = () => {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      <div className="flex gap-4 border-b border-border py-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
      </div>
      <ProductDescriptionSkeleton />
    </div>
  );
};

export default ProductDetailTabsSkeleton;
