'use client';

import { SearchInput } from "@/shared/components/common/search-input";
import { Button } from "@/shared/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import ForwardButton from "../../(components)/forward-button";

const SelectEventHeader = () => {
  const t = useTranslations("reportingTool.selectEvent");
  const [eventId] = useQueryState("eventId", parseAsString);
  const isSwitchEventRoute = Boolean(eventId);

  return (
    <div className="w-full flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
      <div className="flex items-center gap-3">
        {isSwitchEventRoute && (
          <ForwardButton href={`/reporting-tool?tab=dashboard&eventId=${eventId}`} />
        )}
        <h4 className="text-[22px] font-semibold">
          {isSwitchEventRoute ? t("switchEvent") : t("title")}
        </h4>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end md:w-100">
        <SearchInput
          placeholder={t("searchPlaceholder")}
          className="bg-card h-full"
          useDebounced
        />
        <Button
          href="/reporting-tool/new-event">{t("createEvent")} <PlusIcon /></Button>
      </div>
    </div>
  );
}

export default SelectEventHeader;
