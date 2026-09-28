"use client";

import { useTranslations } from "next-intl";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useEventLocationPagination } from "../(hooks)/use-event-location-pagination";
import { useDeleteEventLocation } from "../(hooks)/use-delete-event-location";
import EventAddressNoData from "./event-address-no-data";
import EventAddressPagination from "./event-address-pagination";
import EventAddressRow from "./event-address-row";
import EventAddressTableSkeleton from "./event-address-table-skeleton";

const EventAddressTable = () => {
  const t = useTranslations("events.address.table");
  const { query: { data, isLoading } } = useEventLocationPagination();
  const { mutate: deleteLocation } = useDeleteEventLocation();

  const eventAddresses = data?.items ?? [];

  if (isLoading) {
    return <EventAddressTableSkeleton />;
  }

  if (!eventAddresses.length) {
    return <EventAddressNoData />;
  }

  return (
    <div className="flex flex-col gap-4">
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
            {eventAddresses.map((address) => (
              <EventAddressRow
                key={address.id}
                address={address}
                onDelete={() => deleteLocation(address.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <EventAddressPagination
        totalPages={data?.pagination?.totalPages ?? 1}
        currentPage={data?.pagination?.page ?? 1}
        hasNextPage={data?.pagination?.hasNextPage ?? false}
        hasPrevPage={data?.pagination?.hasPrevPage ?? false}
      />
    </div>
  );
}

export default EventAddressTable;
