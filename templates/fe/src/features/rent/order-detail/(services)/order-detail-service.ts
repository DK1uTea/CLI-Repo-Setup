import { apiProxy } from '@/lib/api';
import type { RentalStatus } from '../../rent-orders/(helpers)/rental-order-map';

export type OrderDetailItem = {
  id: string;
  sku: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  total: number;
};

export type OrderDetailShippingAddress = {
  firstname: string;
  lastname: string;
  street: string;
  city: string;
  region: string | null;
  postcode: string;
  countryId: string;
  telephone: string;
};

export type OrderDetail = {
  orderId: string;
  status: RentalStatus;
  from: string;
  to: string;
  subtotal: number;
  discountAmount: number;
  discountCode?: string | null;
  shippingAmount: number;
  shippingMethod: string;
  total: number;
  customer: {
    name: string;
    email: string;
  };
  shipping: {
    method: string;
    address: OrderDetailShippingAddress;
  };
  items: OrderDetailItem[];
};

type OrderDetailEnvelope = {
  data?: OrderDetail;
};

export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const response = await apiProxy.get<OrderDetailEnvelope>(`etr/orders/${orderId}`);
  return response.data?.data ?? null;
}
