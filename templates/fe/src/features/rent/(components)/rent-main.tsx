import { TabsUrl } from "@/shared/components/ui/tabs-url";
import RentHeader from "./rent-header";
import { TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import CatalogueMain from "../catalogue/(components)/catalogue-main";
import { useTranslations } from "next-intl";
import RentalOrdersMain from "../rent-orders/(components)/rental-orders-main";

const RentMain = () => {
  const t = useTranslations("rent");

  return (
    <div className="flex flex-col gap-8">
      <RentHeader />
      <TabsUrl defaultValue="catalogue" paramName="tab">
        <TabsList variant="line">
          <TabsTrigger value="catalogue">{t("tabs.catalogue")}</TabsTrigger>
          <TabsTrigger value="rented">{t("tabs.rentOrders")}</TabsTrigger>
        </TabsList>
        <TabsContent value="catalogue">
          <CatalogueMain />
        </TabsContent>
        <TabsContent value="rented">
          <RentalOrdersMain />
        </TabsContent>
      </TabsUrl>
    </div>
  );
}

export default RentMain;