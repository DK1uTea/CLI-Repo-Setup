import { useCurrency } from "@/shared/stores/use-user-store";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { OrderDetail } from "../(services)/order-detail-service";
import { useTranslations } from "next-intl";

type Props = {
  order: OrderDetail;
}

const OrderDetailSummaryCard = ({ order }: Props) => {
  const currency = useCurrency();
  const t = useTranslations("rent.orderDetail");

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-2 text-muted-foreground">
          <div className="flex justify-between gap-2">
            <p className="w-1/4 font-medium text-sm">{t("subtotal")}</p>
            <p className="w-1/2 font-normal text-sm">{t("itemCount", { count: order.items.length })}</p>
            <p className="w-1/5 font-medium text-sm">{order.subtotal.toFixed(2)} {currency.symbol}</p>
          </div>
          <div className="flex justify-between gap-2">
            <p className="w-1/4 font-medium text-sm">{t("discount")}</p>
            <p className="w-1/2 font-normal text-sm">{order.discountCode?.trim() || t("noDiscount")}</p>
            <p className="w-1/5 font-medium text-sm">{order.discountAmount.toFixed(2)} {currency.symbol}</p>
          </div>
          <div className="flex justify-between gap-2">
            <p className="w-1/4 font-medium text-sm">{t("shipping")}</p>
            <p className="w-1/2 font-normal text-sm">{order.shippingMethod}</p>
            <p className="w-1/5 font-medium text-sm">{order.shippingAmount.toFixed(2)} {currency.symbol}</p>
          </div>
          <div className="flex justify-between gap-2">
            <p className="w-1/4 font-bold text-sm">{t("total")}</p>
            <p className="w-1/2 font-normal text-sm"></p>
            <p className="w-1/5 font-bold text-sm">{order.total.toFixed(2)} {currency.symbol}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrderDetailSummaryCard;
