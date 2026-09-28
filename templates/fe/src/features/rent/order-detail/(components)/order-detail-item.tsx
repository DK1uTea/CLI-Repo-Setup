import { Card, CardContent } from "@/shared/components/ui/card";
import type { OrderDetailItem as OrderDetailItemType } from "../(services)/order-detail-service";
import { useCurrency } from "@/shared/stores/use-user-store";
import Image from "next/image";
import { Badge } from "@/shared/components/ui/badge";
import { useTranslations } from "next-intl";

type Props = {
  item: OrderDetailItemType;
}
const OrderDetailItem = ({ item }: Props) => {
  const t = useTranslations("rent.orderDetail");
  const currency = useCurrency();
  const formattedPrice = item.price.toFixed(2);
  const formattedTotal = item.total.toFixed(2);

  return (
    <Card className="p-3">
      <CardContent className="p-0">
        <div className="flex gap-4 justify-between">
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={74}
            height={74}
            className="shrink-0 object-contain"
          />
          <div className="grow flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div className="grow flex flex-col gap-2">
              <p className="font-semibold text-sm">{item.name}</p>
              <Badge className="bg-[#0000000F] text-muted-foreground  font-normal text-xs p-1 rounded-[8px]">{t("sku", { sku: item.sku })}</Badge>
            </div>
            <div className="flex justify-between gap-4 sm:contents">
              <div className="shrink-0 font-normal text-sm">
                {formattedPrice} {currency.symbol} x {item.quantity}
              </div>
              <div className="shrink-0 font-semibold text-sm">
                {formattedTotal} {currency.symbol}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrderDetailItem;
