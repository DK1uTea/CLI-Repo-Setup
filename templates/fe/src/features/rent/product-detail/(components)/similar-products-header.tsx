"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";

type SimilarProductsHeaderProps = {
  onPreviousClick: () => void;
  onNextClick: () => void;
};

const SimilarProductsHeader = ({
  onPreviousClick,
  onNextClick,
}: SimilarProductsHeaderProps) => {
  const t = useTranslations("rent.productDetail");

  return (
    <div className="flex flex-row items-center justify-between gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        aria-label={t("previousImage")}
        onClick={onPreviousClick}
        className="z-10 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 md:hidden"
      >
        <ChevronLeftIcon className="size-5" />
      </Button>
      <h2 className="flex-1 text-center text-xl font-semibold md:flex-none md:text-left">
        {t("similarProducts")}
      </h2>
      <div className="flex justify-end gap-3 md:justify-center">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={t("previousImage")}
          onClick={onPreviousClick}
          className="z-10 hidden rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 md:inline-flex"
        >
          <ChevronLeftIcon className="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={t("nextImage")}
          onClick={onNextClick}
          className="z-10 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80"
        >
          <ChevronRightIcon className="size-5" />
        </Button>
      </div>
    </div>
  );
};

export default SimilarProductsHeader;
