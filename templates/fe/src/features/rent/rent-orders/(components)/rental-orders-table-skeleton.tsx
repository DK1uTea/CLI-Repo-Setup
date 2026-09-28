import { useTranslations } from "next-intl";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

const skeletonRows = 6;

const RentalOrdersTableSkeleton = () => {
  const t = useTranslations("rent.rentOrders.table");

  return (
    <div className="overflow-hidden rounded-md border border-border">
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
          {Array.from({ length: skeletonRows }).map((_, index) => (
            <TableRow key={index} className="h-14">
              <TableCell className="px-5">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="px-5">
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell className="px-5">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="px-5">
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell className="w-48 px-5">
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell className="w-64 px-5">
                <div className="flex justify-start gap-2">
                  <Skeleton className="h-7 w-14" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RentalOrdersTableSkeleton;
