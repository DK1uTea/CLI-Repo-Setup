'use client';
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import type { OrderDetail } from "../(services)/order-detail-service";
import { useTranslations } from "next-intl";

type Props = {
  order: OrderDetail;
}

const CustomerInformation = ({ order }: Props) => {
  const t = useTranslations("rent.orderDetail");
  const shippingAddress = order.shipping.address;
  const shippingCityLine = [
    shippingAddress.city,
    shippingAddress.region,
    shippingAddress.postcode,
  ].filter(Boolean).join(", ");

  return (
    <Card className="w-full self-start lg:w-96 xl:w-115 p-3 md:p-5">
      <CardContent className="p-0">
        <div className="flex flex-col gap-3.5">
          <h4 className="text-base font-medium text-foreground">{t("customerInformation")}</h4>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="font-bold text-sm">{t("customer")}</p>
            <p className="text-muted-foreground font-normal text-sm">{order.customer.name}</p>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="font-bold text-sm">{t("customerContact")}</p>
            <p className="text-muted-foreground font-normal text-sm">{order.customer.email}</p>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="font-bold text-sm">{t("shippingAddress")}</p>
            <div className="text-muted-foreground flex flex-col gap-2 font-normal text-sm">
              <p>{shippingAddress.street}</p>
              {shippingCityLine && <p>{shippingCityLine}</p>}
              <p>{shippingAddress.countryId}</p>
              <p>{t("phonePrefix")} {shippingAddress.telephone}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerInformation;
