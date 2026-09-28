"use client";

import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useRentalOrder } from "../(hooks)/use-rental-order";
import RentalOrdersNoData from "./rental-orders-no-data";
import RentalOrdersTablePagination from "./rental-orders-table-pagination";
import RentalOrdersTableRow from "./rental-orders-table-row";
import RentalOrdersTableSkeleton from "./rental-orders-table-skeleton";

const RentalOrdersTable = () => {
  const t = useTranslations("rent.rentOrders.table");
  const { rentalOrders, isLoading, pagination, page, setFilters } = useRentalOrder();

  if (isLoading) {
    return <RentalOrdersTableSkeleton />;
  }

  if (!rentalOrders.length) {
    return <RentalOrdersNoData />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="h-12">
              <TableHead className="px-5">{t("orderId")}</TableHead>
              <TableHead className="px-5">{t("recipient")}</TableHead>
              <TableHead className="px-5">{t("totalAmount")}</TableHead>
              <TableHead className="px-5">{t("status")}</TableHead>
              <TableHead className="w-48 px-5">{t("rentalPeriod")}</TableHead>
              <TableHead className="w-64 px-5">
                <span className="sr-only">{t("actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rentalOrders.map((order) => (
              <RentalOrdersTableRow key={order.id} order={order} />
            ))}
          </TableBody>
        </Table>
      </div>
      <RentalOrdersTablePagination
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={(newPage) => setFilters({ page: newPage })}
      />
    </div>
  );
}

export default RentalOrdersTable
