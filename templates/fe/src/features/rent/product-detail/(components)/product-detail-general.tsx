'use client'

import type { ProductDetail } from "../(services)/product-detail-service";
import ProductGeneralCarousel from "./product-general-carousel";
import ProductGeneralInfo from "./product-general-info";

type Props = {
  product: ProductDetail;
}

const ProductDetailGeneral = ({ product }: Props) => {
  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Carousel */}
      <ProductGeneralCarousel images={images} name={product.name} />
      {/* Info */}
      <ProductGeneralInfo product={product} />
    </div>
  );
}

export default ProductDetailGeneral;
