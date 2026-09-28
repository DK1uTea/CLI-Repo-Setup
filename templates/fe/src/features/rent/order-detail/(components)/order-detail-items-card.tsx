import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useDateFormat } from "@/shared/stores/use-user-store";
import type { RentalStatus } from "../../rent-orders/(helpers)/rental-order-map";
import type { OrderDetail } from "../(services)/order-detail-service";
import ForwardButton from "./forward-button";
import OrderDetailItem from "./order-detail-item";
import { useTranslations } from "next-intl";

type Props = {
  order: OrderDetail;
}

const statusClassName: Record<RentalStatus, string> = {
  pending: "bg-[#facc15]/20 text-[#a16207]",
  processing: "bg-[#60a5fa]/20 text-[#1d4ed8]",
  holded: "bg-[#f97316]/20 text-[#c2410c]",
  canceled: "bg-[#9ca3af]/20 text-[#4b5563]",
  complete: "bg-[#10b981]/20 text-[#047857]",
};

const statusTranslationKey = {
  pending: "statusPending",
  processing: "statusProcessing",
  holded: "statusOnHold",
  canceled: "statusCanceled",
  complete: "statusCompleted",
} as const satisfies Record<RentalStatus, string>;

const OrderDetailItemsCard = ({ order }: Props) => {
  const t = useTranslations("rent.orderDetail");
  const tRentOrders = useTranslations("rent.rentOrders");
  const dateFormat = useDateFormat();

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <ForwardButton />
            <div className="flex flex-col grow">
              <div className="flex gap-2">
                <p className="font-semibold text-base capitalize">{t("orderNumber", { id: order.orderId })}</p>
                <Badge
                  variant="secondary"
                  className={cn("capitalize font-semibold text-xs", statusClassName[order.status])}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {tRentOrders(statusTranslationKey[order.status])}
                </Badge>
              </div>
              <p className="font-normal text-sm text-muted-foreground">{t("rentedFrom")}: <span className="text-xs">{formatDate(order.from, dateFormat, true)}</span></p>
              <p className="font-normal text-sm text-muted-foreground">{t("rentedTo")}: <span className="text-xs">{formatDate(order.to, dateFormat, true)}</span></p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {order.items.map((item) => (
              <OrderDetailItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrderDetailItemsCard;
