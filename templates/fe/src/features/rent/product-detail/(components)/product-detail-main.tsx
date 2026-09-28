'use client';

import { PackageXIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty";
import { useBreadcrumbs } from "@/shared/hooks/common/use-breadcrumbs";
import { useRentUrlDates } from "../../(hooks)/use-rent-url-dates";
import { useRentalProductDetail } from "../(hooks)/use-rental-product-detail";
import ProductDetailGeneral from "./product-detail-general";
import ProductDetailGeneralSkeleton from "./product-detail-general-skeleton";
import ProductDetailTabs from "./product-detail-tabs";
import SimilarProducts from "./similar-products";

type Props = {
  slug: string;
}

const ProductDetailMain = ({ slug }: Props) => {
  const tRent = useTranslations("rent");
  const t = useTranslations("rent.productDetail");
  const { fromIso, toIso, isReady } = useRentUrlDates({ requireRange: true, syncInvalid: true });

  const {
    rentalProductDetail,
    isLoading: isProductLoading,
  } = useRentalProductDetail(slug, isReady ? { from: fromIso, to: toIso } : undefined);
  const isLoading = !isReady || isProductLoading;

  useBreadcrumbs([
    { label: tRent("tabs.catalogue"), href: "/rent?tab=catalogue" },
    ...(rentalProductDetail ? [{ label: rentalProductDetail.name }] : []),
  ]);

  if (!isLoading && !rentalProductDetail) {
    return (
      <Empty>
        <EmptyMedia>
          <PackageXIcon className="size-24 text-primary opacity-40" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{t("notFound")}</EmptyTitle>
          <EmptyDescription>{t("notFoundDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {isLoading || !rentalProductDetail
        ? <ProductDetailGeneralSkeleton />
        : <ProductDetailGeneral product={rentalProductDetail} />}

      <ProductDetailTabs product={rentalProductDetail} isLoading={isLoading} />

      <SimilarProducts slug={slug} />
    </div>
  );
}

export default ProductDetailMain;
