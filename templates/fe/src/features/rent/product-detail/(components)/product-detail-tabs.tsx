import { TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { TabsUrl } from "@/shared/components/ui/tabs-url";
import { useTranslations } from "next-intl";
import type { ProductDetail } from "../(services)/product-detail-service";
import ProductDescription from "./product-description";
import ProductDetailTabsSkeleton from "./product-detail-tabs-skeleton";
import { ProductDocuments } from "./product-documents";
import RentalAvailability from "./rental-availability";

type Props = {
  product?: ProductDetail;
  isLoading?: boolean;
}

const ProductDetailTabs = ({ product, isLoading }: Props) => {
  const t = useTranslations("rent.productDetail");

  if (isLoading || !product) {
    return <ProductDetailTabsSkeleton />;
  }

  const isBundle = product.productType === "bundle";

  return (
    <TabsUrl defaultValue="description" paramName="tab" syncUrl={!isBundle}>
      <TabsList variant="line">
        <TabsTrigger value="description" className="px-4 py-3">{t("description")}</TabsTrigger>
        {!isBundle && (
          <TabsTrigger value="availability" className="px-4 py-3">{t("availability")}</TabsTrigger>
        )}
        <TabsTrigger value="documents" className="px-4 py-3">{t("documents")}</TabsTrigger>
      </TabsList>
      <TabsContent value="description">
        <ProductDescription product={product} />
      </TabsContent>
      {!isBundle && (
        <TabsContent value="availability">
          <RentalAvailability product={product} source="rent" />
        </TabsContent>
      )}
      <TabsContent value="documents">
        <ProductDocuments sku={product.sku} />
      </TabsContent>
    </TabsUrl>
  );
}

export default ProductDetailTabs;
