'use client'

import { parseAsString, useQueryState } from "nuqs";
import { Button } from "@/shared/components/ui/button";
import EventAddressAddDialog from "@/features/events/event-address/(components)/event-address-add-dialog";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";


export default function EventListHeader() {
  const t = useTranslations("events");
  const [tab] = useQueryState("tab", parseAsString.withDefault("events"));
  const isAddressTab = tab === "address";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3">
        <h4 className="font-semibold text-[22px] text-left">{t("title")}</h4>
      </div>
      {isAddressTab ? (
        <EventAddressAddDialog />
      ) : (
        <Button
          className="shrink-0"
          href="/events/new-event"
        >
          {t("newEvent")}
          <PlusIcon strokeWidth={3} />
        </Button>
      )}
    </div>
  )
}
