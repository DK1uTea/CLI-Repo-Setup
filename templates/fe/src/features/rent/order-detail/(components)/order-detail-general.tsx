import type { OrderDetail } from "../(services)/order-detail-service";
import OrderDetailItemsCard from "./order-detail-items-card";
import OrderDetailSummaryCard from "./order-detail-summary-card";

type Props = {
  order: OrderDetail;
}

const OrderDetailGeneral = ({ order }: Props) => {
  return (
    <div className="flex flex-col gap-5 lg:grow">
      <OrderDetailItemsCard order={order} />
      <OrderDetailSummaryCard order={order} />
    </div>
  );
}

export default OrderDetailGeneral;
