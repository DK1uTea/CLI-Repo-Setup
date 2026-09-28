'use client';

import { useRelatedProducts } from "../(hooks)/use-related-products";
import { useProductCarousel } from "../(hooks)/use-product-carousel";
import SimilarProductsCarousel from "./similar-products-carousel";
import SimilarProductsHeader from "./similar-products-header";
import SimilarProductsSkeleton from "./similar-products-skeleton";
import { Button } from "@/shared/components/ui/button";
import { useTranslations } from "next-intl";

type Props = {
  slug: string;
}

const SimilarProducts = ({ slug }: Props) => {

  const t = useTranslations("rent");
  const { data, isLoading } = useRelatedProducts(slug);
  const products = data ?? [];

  const {
    carouselPlugins,
    setApi,
    handlePreviousClick,
    handleNextClick,
  } = useProductCarousel({ imageCount: products.length });

  if (isLoading) {
    return <SimilarProductsSkeleton />;
  }

  if (!products.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <SimilarProductsHeader
        onPreviousClick={handlePreviousClick}
        onNextClick={handleNextClick}
      />
      <SimilarProductsCarousel
        carouselPlugins={carouselPlugins}
        products={products}
        setApi={setApi}
      />
      <Button href="/rent" className="mx-auto">
        {t("seeOtherProducts")}
      </Button>
    </div>
  );
}

export default SimilarProducts;
