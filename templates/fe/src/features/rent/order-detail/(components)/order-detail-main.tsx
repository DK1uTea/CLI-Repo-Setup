'use client';

import { parseAsString, useQueryState } from "nuqs";
import { useTranslations } from "next-intl";
import { useBreadcrumbs } from "@/shared/hooks/common/use-breadcrumbs";
import CustomerInformation from "./customer-information";
import OrderDetailNoData from "./order-detail-no-data";
import OrderDetailGeneral from "./order-detail-general";
import OrderDetailSkeleton from "./order-detail-skeleton";
import { useOrderDetail } from "../(hooks)/use-order-detail";

const OrderDetailMain = () => {
  const tRent = useTranslations("rent");
  const t = useTranslations("rent.orderDetail");
  const [orderId] = useQueryState("order_id", parseAsString.withDefault(""));

  const { orderDetail, isLoading } = useOrderDetail(orderId);

  useBreadcrumbs([
    { label: tRent("tabs.rentOrders"), href: "/rent?tab=rented" },
    ...(orderDetail ? [{ label: t("orderNumber", { id: orderDetail.orderId }) }] : []),
  ]);

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (!orderDetail) {
    return <OrderDetailNoData />;
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <OrderDetailGeneral order={orderDetail} />
      <CustomerInformation order={orderDetail} />
    </div>
  );
}

export default OrderDetailMain;
