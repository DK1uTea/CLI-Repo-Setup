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

const EventAddressTableSkeleton = () => {
  const t = useTranslations("events.address.table");

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="h-12">
            <TableHead className="px-5">{t("venueName")}</TableHead>
            <TableHead className="px-5">{t("street")}</TableHead>
            <TableHead className="px-5">{t("postalCode")}</TableHead>
            <TableHead className="px-5">{t("city")}</TableHead>
            <TableHead className="px-5">
              <span className="sr-only">{t("actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: skeletonRows }).map((_, index) => (
            <TableRow key={index} className="h-14">
              <TableCell className="px-5">
                <Skeleton className="h-4 w-44" />
              </TableCell>
              <TableCell className="px-5">
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell className="px-5">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="px-5">
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell className="px-5">
                <div className="flex justify-end gap-1.5">
                  <Skeleton className="size-7" />
                  <Skeleton className="size-7" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EventAddressTableSkeleton;
