"use client";

import { useEffect, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import type { CarouselApi } from "@/shared/components/ui/carousel";

type UseProductCarouselProps = {
  imageCount: number;
}

export const useProductCarousel = ({ imageCount }: UseProductCarouselProps) => {

  const autoplayPlugin = useRef(Autoplay({
    delay: 2000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  }));
  const carouselPlugins = useRef([autoplayPlugin.current]);
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
    autoplayPlugin.current.reset();
    setSelectedIndex(index);
  };

  const handlePreviousClick = () => {
    api?.scrollPrev();
    autoplayPlugin.current.reset();
  };

  const handleNextClick = () => {
    api?.scrollNext();
    autoplayPlugin.current.reset();
  };

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    handleSelect();
    api.on("select", handleSelect);
    api.on("reInit", handleSelect);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) {
      setSelectedIndex(0);
      return;
    }

    api.scrollTo(0, true);
    setSelectedIndex(0);
  }, [api, imageCount]);

  return {
    carouselPlugins: imageCount > 1 ? carouselPlugins.current : undefined,
    setApi,
    selectedIndex,
    handleThumbnailClick,
    handlePreviousClick,
    handleNextClick,
  };
}
