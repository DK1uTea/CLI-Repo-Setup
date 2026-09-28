import { useTranslations } from "next-intl";
import type { ProductDetail } from "../(services)/product-detail-service";
import { ProductDetailDimensions } from "./product-detail-dimensions";

type Props = {
  product: ProductDetail;
}

const ProductDescription = ({ product }: Props) => {
  const t = useTranslations("rent.productDetail");
  const bundleItems = Array.isArray(product.children) ? product.children : [];

  return (
    <ProductDetailDimensions
      weight={product.weight}
      length={product.length}
      width={product.width}
      height={product.height}
      bundleItems={product.productType === 'bundle' ? bundleItems : undefined}
      t={t as (key: string) => string}
    />
  );
}

export default ProductDescription;
