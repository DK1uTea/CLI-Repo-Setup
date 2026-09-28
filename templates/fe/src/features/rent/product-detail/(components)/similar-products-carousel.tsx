"use client";

import type { ComponentProps } from "react";
import { ProductCatalogCard } from "../../(components)/product-catalog-card";
import type { ProductCatalogItem } from "@/features/rent/catalogue/(services)/product-service";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/shared/components/ui/carousel";

type SimilarProductsCarouselProps = {
  carouselPlugins?: ComponentProps<typeof Carousel>["plugins"];
  products: ProductCatalogItem[];
  setApi: (api: CarouselApi) => void;
};

const SimilarProductsCarousel = ({
  carouselPlugins,
  products,
  setApi,
}: SimilarProductsCarouselProps) => {
  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", loop: products.length > 1 }}
      plugins={carouselPlugins}
      className="w-full"
    >
      <CarouselContent>
        {products.map((product) => (
          <CarouselItem
            key={product.id}
            className="flex basis-[84%] sm:basis-[44%] xl:basis-[22%]"
          >
            <ProductCatalogCard
              name={product.name}
              price={product.price}
              productType={product.productType}
              quantity={product.totalQuantity}
              availableQuantity={product.availableQuantity}
              isAvailable={product.isAvailable}
              isNew={product.isNew ?? false}
              slug={product.slug}
              imageUrl={product.imageUrl}
              hasLinkToDetail={true}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export default SimilarProductsCarousel;
