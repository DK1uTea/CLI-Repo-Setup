'use client';

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { cn } from "@/lib/utils";
import { dayjs, formatDate, nowUtc } from "@/lib/date-utils";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from "@/shared/constants/permissions";
import { useDateFormat, useUserStore } from "@/shared/stores/use-user-store";
import type { RentalOrder, RentalStatus } from "../(helpers)/rental-order-map";

type RentalOrdersTableRowProps = {
  order: RentalOrder;
};

const statusClassName: Record<RentalStatus, string> = {
  pending: "bg-[#facc15]",
  processing: "bg-[#60a5fa]",
  holded: "bg-[#f97316]",
  canceled: "bg-[#9ca3af]",
  complete: "bg-[#10b981]",
};

const statusTranslationKey = {
  pending: "statusPending",
  processing: "statusProcessing",
  holded: "statusOnHold",
  canceled: "statusCanceled",
  complete: "statusCompleted",
} as const satisfies Record<RentalStatus, string>;

const formatRentalDate = (value: string, dateFormat: ReturnType<typeof useDateFormat>) => {
  const date = dayjs.utc(value, "YYYY-MM-DD HH:mm:ss", true);
  return date.isValid() ? formatDate(date.toDate(), dateFormat) : "-";
};

const formatTotalAmount = (value: number) => {
  return value.toFixed(2);
};

const RentalOrdersTableRow = ({ order }: RentalOrdersTableRowProps) => {
  const t = useTranslations("rent.rentOrders");
  const dateFormat = useDateFormat();
  const permissions = useUserStore((state) => state.permissions);
  const orderHref = `/rent/order?order_id=${order.id}`;
  const rentalPeriod = `${formatRentalDate(order.startTime, dateFormat)} - ${formatRentalDate(order.endTime, dateFormat)}`;
  const isWildcardAdmin = permissions?.includes(PERMISSION_ALL_WILDCARD) ?? false;
  const canEdit = isWildcardAdmin || (permissions?.includes(PERMISSIONS.Event.Management) ?? false);
  const startTime = dayjs.utc(order.startTime, "YYYY-MM-DD HH:mm:ss", true);
  const canUsePrimaryCancel =
    order.status !== "complete" &&
    order.status !== "canceled" &&
    startTime.isValid() &&
    startTime.isAfter(dayjs.utc(nowUtc()).add(10, "day"));

  return (
    <TableRow className="h-14">
      <TableCell className="p-0 font-medium">
        <Link href={orderHref} className="flex h-14 items-center px-5">
          {order.id}
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <Link href={orderHref} className="flex h-14 items-center px-5">
          {order.recipientName ?? "-"}
        </Link>
      </TableCell>
      <TableCell className="p-0 font-bold">
        <Link href={orderHref} className="flex h-14 items-center px-5">
          {formatTotalAmount(order.totalAmount)} €
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <Link href={orderHref} className="flex h-14 items-center px-5">
          <Badge
            variant="secondary"
            className={cn("capitalize text-white h-6.5", statusClassName[order.status])}
          >
            {t(statusTranslationKey[order.status])}
          </Badge>
        </Link>
      </TableCell>
      <TableCell className="w-48 p-0">
        <Link href={orderHref} className="flex h-14 items-center px-5">
          {rentalPeriod}
        </Link>
      </TableCell>
      <TableCell className="w-64 whitespace-nowrap px-5">
        <div className="flex justify-start gap-2">
          {canEdit && (
            <Button type="button" variant="outline" disabled>
              {t("edit")}
            </Button>
          )}
          {isWildcardAdmin && (
            <Button
              type="button"
              variant={canUsePrimaryCancel ? "default" : "outline"}
              disabled
            >
              {t("cancel")}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RentalOrdersTableRow;
