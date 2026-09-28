import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';

export type ProductDetailDimensionBundleItem = {
  sku: string;
  name: string;
  requiredQty: number;
};

const BUNDLE_PRODUCTS_HEADING_ID = 'product-detail-dimensions-bundle-heading';

type Props = {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  bundleItems?: ProductDetailDimensionBundleItem[];
  t: (key: string) => string;
};

// Shared between events/product-detail and rent/product-detail's Description
// tab — physical dimensions live here, not in the info-panel shell, so a
// product with none of these fields still shows all four rows with a dash.
export function ProductDetailDimensions({ weight, length, width, height, bundleItems, t }: Props) {
  const safeBundleItems = Array.isArray(bundleItems) ? bundleItems : [];

  return (
    <div className="py-4">
      <Card className="w-full max-w-125">
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-muted-foreground">
              <span>{t("weight")}</span>
              <span>{weight ?? '-'} kg</span>
            </div>
            <Separator />
            <div className="flex justify-between text-muted-foreground">
              <span>{t("length")}</span>
              <span>{length ?? '-'} cm</span>
            </div>
            <Separator />
            <div className="flex justify-between text-muted-foreground">
              <span>{t("width")}</span>
              <span>{width ?? '-'} cm</span>
            </div>
            <Separator />
            <div className="flex justify-between text-muted-foreground">
              <span>{t("height")}</span>
              <span>{height ?? '-'} cm</span>
            </div>
            <Separator />
            {safeBundleItems.length > 0 && (
              <section className="flex flex-col gap-3" aria-labelledby={BUNDLE_PRODUCTS_HEADING_ID}>
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <h2 id={BUNDLE_PRODUCTS_HEADING_ID}>{t('bundleProduct')}</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={t('bundleProductInfo')}
                        className="flex size-4 cursor-default items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                      >
                        <span aria-hidden="true">!</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-62.5 text-xs leading-normal">{t('bundleProductInfo')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <ul aria-labelledby={BUNDLE_PRODUCTS_HEADING_ID} className="flex flex-col gap-2 text-sm">
                  {safeBundleItems.map((item) => (
                    <li
                      key={item.sku}
                      className="flex items-center gap-1 border-b pb-2 text-muted-foreground last:border-b-0 last:pb-0"
                      translate="no"
                    >
                      <span>{item.name}</span>
                      <span>X {item.requiredQty}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
