'use client'

import { Button } from "@/shared/components/ui/button";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import { CalendarDays } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useTranslations } from "next-intl";
import { useRentUrlDates } from "../(hooks)/use-rent-url-dates";

const RentHeader = () => {
  const t = useTranslations("rent");
  const [tab] = useQueryState("tab", parseAsString);
  const { from, to, setDateRange } = useRentUrlDates({
    syncInvalid: tab !== 'rented',
  });

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-1">
        <h4 className="font-bold text-[22px] text-left">{t("header.title")}</h4>
        <p className="text-foreground/60 text-left">{t("header.description")}</p>
      </div>
      {tab !== 'rented' && (
        <DateRangePicker
          defaultValue={{ from: from ?? undefined, to: to ?? undefined }}
          disablePast
          onApplyAction={setDateRange}
          trigger={(
            <Button className="shrink-0">
              {t("dateRange")}
              <CalendarDays data-icon="inline-end" />
            </Button>
          )}
        />
      )}
    </div>
  );
}

export default RentHeader;
