export type RentalStatus =
  | "pending"
  | "processing"
  | "complete"
  | "holded"
  | "canceled"
  ;

export type RentalOrder = {
  id: string;
  recipientName: string;
  totalAmount: number;
  status: RentalStatus;
  startTime: string;
  endTime: string;
};

export const rentalOrderSortByMap: Record<string, string> = {
  created_at_desc: "newest",
  created_at_asc: "oldest",
  entity_id_desc: "order_id_desc",
  entity_id_asc: "order_id_asc",
};
