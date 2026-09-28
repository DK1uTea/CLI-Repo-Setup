'use client'

import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import { useCurrency } from "@/shared/stores/use-user-store";
import { useTranslations } from "next-intl";
import { ExpandableHtml } from "@/shared/components/common/expandable-html";
import { useRentUrlDates } from "../../(hooks)/use-rent-url-dates";
import { hasDisplayValue } from "../(helpers)/product-detail-display";
import { ProductDetailInfoShell, type ProductDetailInfoRow } from "./product-detail-info-shell";
import { ProductDetailDownloadPdf } from "./product-detail-download-pdf";
import type { ProductDetail } from "../(services)/product-detail-service";

type Props = {
  product: ProductDetail;
}

const ProductGeneralInfo = ({ product }: Props) => {

  const t = useTranslations("rent.productDetail");
  const tCommon = useTranslations("common");
  const currency = useCurrency();
  const { from, to, setDateRange } = useRentUrlDates({ requireRange: true });

  const categoryLabels = Array.isArray(product.categoryLabels) ? product.categoryLabels : [];
  const material = Array.isArray(product.material) ? product.material : [];

  const descriptiveDetails: ProductDetailInfoRow[] = [
    { label: t('category'), value: categoryLabels.join(', ') },
    { label: t('branding'), value: product.brand },
    { label: t('manufacturer'), value: product.manufacturer },
    { label: t('materialType'), value: material.join(', ') },
    { label: t('shippingMethod'), value: product.shippingMethod },
  ].filter((detail): detail is ProductDetailInfoRow => hasDisplayValue(detail.value));

  return (
    <ProductDetailInfoShell
      name={product.name}
      downloadPdfButton={<ProductDetailDownloadPdf product={product} />}
      availableQuantity={product.availableQuantity}
      totalQuantity={product.totalQuantity}
      priceLabel={t('price')}
      price={product.price}
      currencySymbol={currency.symbol}
      descriptiveDetails={descriptiveDetails}
      t={t as (key: string) => string}
      actionArea={
        <>
          <DateRangePicker
            className="w-full max-w-120"
            defaultValue={{ from: from ?? undefined, to: to ?? undefined }}
            disablePast
            onApplyAction={setDateRange}
            label={{
              startLabel: t("rentFrom"),
              endLabel: t("rentTo")
            }}
          />
          <div>
            <p className="text-gray-500 text-xs">{t("shortDescription")}</p>
            {product.shortDescription?.trim() ? (
              <ExpandableHtml
                html={product.shortDescription}
                className="text-sm text-foreground"
                seeMoreLabel={tCommon("seeMore")}
                seeLessLabel={tCommon("seeLess")}
              />
            ) : (
              <p className="text-sm text-foreground">{t("emptyValue")}</p>
            )}
          </div>
        </>
      }
    />
  );
}

export default ProductGeneralInfo;
