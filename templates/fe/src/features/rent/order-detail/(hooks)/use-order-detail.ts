'use client';

import { useQuery } from "@tanstack/react-query";
import { getOrderDetail } from "../(services)/order-detail-service";

export const useOrderDetail = (orderId: string) => {
  const query = useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: () => getOrderDetail(orderId),
    enabled: !!orderId,
  });

  return {
    orderDetail: query.data ?? undefined,
    isLoading: query.isLoading,
  };
}
