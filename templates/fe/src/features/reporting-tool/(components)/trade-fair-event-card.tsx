'use client';

import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { formatDate } from "@/lib/date-utils";
import { useDateFormat } from "@/shared/stores/use-user-store";
import type { TradeFairEvent } from "../(helpers)/trade-fair-event-type";
import Image from "next/image";
import { ArrowLeftRight, ArrowRight, Calendar1, MapPin, Monitor, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTradeFairEventType } from "../trade-fair-event-form/(hooks)/use-trade-fair-event-type";

import DeleteEventAlertDialog from "./delete-event-alert-dialog";

type Props = {
  event: TradeFairEvent;
}

const statusVariant: Record<TradeFairEvent["status"], "published" | "draft" | "cancelled"> = {
  PUBLISHED: "published",
  DRAFT: "draft",
  CANCELLED: "cancelled",
};

const TradeFairEventCard = ({ event }: Props) => {
  const t = useTranslations("reportingTool.eventCard");
  const [eventId] = useQueryState("eventId", parseAsString);
  const pathname = usePathname();
  const router = useRouter();
  const dateFormat = useDateFormat();
  const { eventTypes } = useTradeFairEventType();
  const dateRange = `${formatDate(event.startDate, dateFormat)} - ${formatDate(event.endDate, dateFormat)}`;
  const attachments = Array.isArray(event.attachments) ? event.attachments : [];
  const imageUrl = attachments[0]?.url;
  const city = event.location?.city;
  const isSelectEventRoute = pathname === "/reporting-tool/select-event";
  const isDetailRoute = !isSelectEventRoute && pathname === "/reporting-tool" && Boolean(eventId);
  const isSwitchEventRoute = isSelectEventRoute && eventId === event.id;
  const isHighlighted = isDetailRoute || isSwitchEventRoute;
  const isDefaultMode = !isDetailRoute && !isSwitchEventRoute;
  const isPublished = event.status === "PUBLISHED";
  const eventTypeLabel = eventTypes.find(
    ({ value }) => value === event.type.toLowerCase(),
  )?.label ?? event.type;

  const handleCardClick = () => {
    if (isDetailRoute) {
      router.push(`/reporting-tool/event-detail?id=${event.id}`);
      return;
    }

    if (isDefaultMode || isSwitchEventRoute) {
      router.push(`/reporting-tool?tab=dashboard&eventId=${event.id}`);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        "relative cursor-pointer",
        {
          "bg-[linear-gradient(0deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%),linear-gradient(90deg,rgb(224,0,8)_0.1%,rgb(114,0,64)_99.88%)]! text-card": isHighlighted,
          "hover:bg-primary/10 border border-transparent hover:border-primary transition-colors": isDefaultMode,
        },
      )}
    >
      {isDetailRoute && (
        <DeleteEventAlertDialog eventId={event.id}>
          <Button
            aria-label={t("deleteEvent")}
            className="absolute top-3 right-3 z-10 bg-background text-foreground opacity-0 transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
            size="icon"
            variant="outline"
          >
            <Trash2 />
          </Button>
        </DeleteEventAlertDialog>
      )}
      <CardContent className="gap-0">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-muted sm:h-40 sm:w-56 sm:shrink-0 lg:w-64">
            {isSwitchEventRoute && (
              <Badge className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground">
                {t("selected")}
              </Badge>
            )}
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={event.name}
                fill
                sizes="(min-width: 1024px) 256px, (min-width: 640px) 224px, 100vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-4 sm:grow lg:flex-row lg:items-end">
            <div className="flex flex-col gap-3 sm:grow">
              <p className="text-xl font-semibold">{event.name}</p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex gap-2 items-center">
                  <Monitor className={cn("size-4 text-muted-foreground", isHighlighted && "text-card/80")} />
                  <span className={cn("text-muted-foreground", isHighlighted && "text-card/80")}>
                    {eventTypeLabel}
                  </span>
                  <StatusBadge variant={statusVariant[event.status]} className="capitalize">
                    {t(`status.${event.status}`)}
                  </StatusBadge>
                </div>
                {city && (
                  <div className="flex gap-2 items-center">
                    <MapPin className={cn("size-4 text-muted-foreground", isHighlighted && "text-card/80")} />
                    <span className={cn("text-muted-foreground", isHighlighted && "text-card/80")}>{city}</span>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <Calendar1 className={cn("size-4 text-muted-foreground", isHighlighted && "text-card/80")} />
                  <span className={cn("text-muted-foreground", isHighlighted && "text-card/80")}>{dateRange}</span>
                </div>
              </div>
              <p className={cn("line-clamp-2 min-h-10 max-w-125 text-sm text-muted-foreground", isHighlighted && "text-card/80")}>
                {event.description}
              </p>
            </div>
            {isDetailRoute && (
              <div className="flex flex-col gap-2 lg:flex-row lg:self-end" onClick={(clickEvent) => clickEvent.stopPropagation()}>
                <Button
                  variant="outline-primary"
                  className="bg-card hover:bg-card/80"
                  href={`/reporting-tool/update-event?id=${event.id}`}
                >
                  {t("editEvent")} <Pencil data-icon="inline-end" />
                </Button>
                <Button
                  href={`/reporting-tool/select-event?eventId=${event.id}`}
                >
                  {t("changeEvent")} <ArrowLeftRight data-icon="inline-end" />
                </Button>
              </div>
            )}
            {isSwitchEventRoute && (
              <div className="flex flex-col gap-2 lg:self-end" onClick={(clickEvent) => clickEvent.stopPropagation()}>
                <Button
                  href={`/reporting-tool?tab=dashboard&eventId=${event.id}`}
                >
                  {t("openEvent")} <ArrowRight data-icon="inline-end" />
                </Button>
                {isPublished && (
                  <p className="text-sm text-card/80 self-end lg:self-center">{t("activeEvent")}</p>
                )}
              </div>
            )}
            {isDefaultMode && (
              <Button
                variant="outline-primary"
                className="lg:self-end border-[#93c5fd4d]"
                href={`/reporting-tool?tab=dashboard&eventId=${event.id}`}
                onClick={(clickEvent) => clickEvent.stopPropagation()}
              >
                {t("viewDetails")} <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

  );
}

export default TradeFairEventCard;
