"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/components/ui/carousel";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon, PackageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useProductCarousel } from "../(hooks)/use-product-carousel";

type Props = {
  images: string[];
  name: string;
}

const ProductGeneralCarousel = ({ images, name }: Props) => {

  const t = useTranslations("rent.productDetail");
  const {
    carouselPlugins,
    setApi,
    selectedIndex,
    handleThumbnailClick,
    handlePreviousClick,
    handleNextClick,
  } = useProductCarousel({ imageCount: images.length });

  if (images.length === 0) {
    return (
      <div className="flex aspect-7/6 w-full items-center justify-center rounded-lg border bg-card lg:w-1/2">
        <PackageIcon className="size-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row-reverse lg:w-1/2">
      <div className="min-w-0 flex-1 sm:mx-4">
        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: images.length > 1 }}
          plugins={carouselPlugins}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={`${image}-${index}`}>
                <div className="relative flex aspect-7/6 w-full items-center justify-center overflow-hidden rounded-lg border bg-card">
                  <Image
                    src={image}
                    alt={t("imageAlt", { name, index: index + 1 })}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain p-6"
                    priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                aria-label={t("previousImage")}
                onClick={handlePreviousClick}
                className="absolute inset-y-0 left-3 z-10 my-auto rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80"
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                aria-label={t("nextImage")}
                onClick={handleNextClick}
                className="absolute inset-y-0 right-3 z-10 my-auto rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80"
              >
                <ChevronRightIcon />
              </Button>
            </>
          )}
        </Carousel>
      </div>
      <div className="flex gap-2 overflow-x-auto sm:w-24 sm:flex-col sm:overflow-visible">
        {images.map((image, index) => (
          <Button
            key={`${image}-thumbnail-${index}`}
            type="button"
            variant="outline"
            size="icon"
            aria-label={t("showProductImage", { index: index + 1 })}
            aria-current={selectedIndex === index}
            onClick={() => handleThumbnailClick(index)}
            className={cn(
              "relative aspect-square h-auto w-24 shrink-0 overflow-hidden rounded-xl bg-card p-0 transition-colors hover:bg-card sm:w-full border-2",
              selectedIndex === index ? "border-primary" : "border-border"
            )}
          >
            <Image
              src={image}
              alt={t("thumbnailAlt", { name, index: index + 1 })}
              fill
              sizes="(min-width: 640px) 96px, 96px"
              className="object-contain p-2"
            />
          </Button>
        ))}
      </div>
    </div>
  );
}

export default ProductGeneralCarousel;
