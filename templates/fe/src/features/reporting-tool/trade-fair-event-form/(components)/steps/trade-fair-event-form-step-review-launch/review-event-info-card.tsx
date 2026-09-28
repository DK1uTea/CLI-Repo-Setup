"use client";

import { usePathname } from "@/i18n/navigation";
import { parseAsString, useQueryState } from "nuqs";
import type { TradeFairEvent } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";
import { formatDate } from "@/lib/date-utils";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/shared/components/ui/table";
import { useDateFormat } from "@/shared/stores/use-user-store";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useTradeFairEventActions } from "../../../(hooks)/use-trade-fair-event-action";
import ReviewEventInfoTableSkeleton from "./review-event-info-table-skeleton";

type Props = {
  eventDetail?: TradeFairEvent;
  isEventDetailLoading: boolean;
};

const ReviewEventInfoCard = ({ eventDetail, isEventDetailLoading }: Props) => {
  const t = useTranslations("reportingTool.tradeFairEventForm.reviewLaunch");
  const dateFormat = useDateFormat();
  const { goToStep } = useTradeFairEventActions();
  const pathname = usePathname();
  const [eventId] = useQueryState("id", parseAsString);

  const isEventDetail = pathname === "/reporting-tool/event-detail";
  const targetId = eventId || eventDetail?.id;

  const location = eventDetail?.location;
  const eventImageUrl = eventDetail?.attachments?.[0]?.url;
  const eventInfoRows = [
    {
      label: t("eventDetails.eventName"),
      value: eventDetail?.name,
    },
    {
      label: t("eventDetails.eventType"),
      value: eventDetail?.type,
    },
    {
      label: t("eventDetails.dates"),
      value: eventDetail
        ? `${formatDate(eventDetail.startDate, dateFormat, true)} - ${formatDate(eventDetail.endDate, dateFormat, true)}`
        : undefined,
    },
    {
      label: t("eventDetails.location"),
      value: location
        ? [location.locationName, location.street, location.city]
          .filter(Boolean)
          .join(", ")
        : undefined,
    },
  ];

  return (
    <Card>
      <CardContent className="gap-0">
        <div className="flex flex-col gap-4">
          <Card className="ring-0 p-0">
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between p-0">
              <div>
                <CardTitle>{t("eventDetails.title")}</CardTitle>
                <CardDescription>{t("eventDetails.description")}</CardDescription>
              </div>
              <Button
                variant="outline-primary"
                className="w-full lg:w-fit"
                href={isEventDetail && targetId ? `/reporting-tool/update-event?id=${targetId}&step=general-info&referrer=eventDetail` : undefined}
                onClick={isEventDetail ? undefined : () => goToStep("general-info")}
              >
                {isEventDetail ? t("editDetails") : t("edit")} <Pencil data-icon="inline-end" />
              </Button>
            </CardHeader>
            <CardContent className="gap-0 p-0">
              {isEventDetailLoading ? (
                <ReviewEventInfoTableSkeleton />
              ) : (
                <div className="overflow-hidden rounded-xl border border-border">
                  <Table>
                    <TableBody>
                      {eventInfoRows.map((row) => (
                        <TableRow key={row.label} className="h-12 hover:bg-transparent">
                          <TableCell className="w-50 border-r px-5 py-3 font-medium">
                            {row.label}
                          </TableCell>
                          <TableCell className="px-5 py-3 whitespace-normal font-light">
                            {row.value || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="ring-0 p-0">
            <CardHeader className="p-0">
              <CardTitle>{t("eventImage.title")}</CardTitle>
              <CardDescription>{t("eventImage.description")}</CardDescription>
            </CardHeader>
            <CardContent className="gap-0 p-0">
              {isEventDetailLoading ? (
                <div className="h-60 w-full animate-pulse rounded-lg bg-muted" />
              ) : eventImageUrl ? (
                <div className="relative h-100 w-full overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={eventImageUrl}
                    alt={eventDetail?.name || t("eventImage.alt")}
                    fill
                    sizes="(min-width: 1024px) 768px, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-60 w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                  {t("eventImage.empty")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReviewEventInfoCard;
