'use client';

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calendar1, ChevronLeft, ChevronRight } from "lucide-react";

import { dayjs, nowUtc } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { getRentalAvailabilityMonthOptions } from "../(helpers)/rental-availability-utils";

type Props = {
  value: Date;
  onChangeAction: (date: Date) => void;
  className?: string;
};

const RentalAvailabilityMonthPicker = ({ value, onChangeAction, className }: Props) => {
  const locale = useLocale();
  const tProductDetail = useTranslations("rent.productDetail");
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(dayjs.utc(value).year());
  const currentMonth = dayjs.utc(nowUtc()).startOf("month");
  const currentYear = currentMonth.year();
  const selected = dayjs.utc(value);
  const monthOptions = getRentalAvailabilityMonthOptions(locale);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setViewYear(selected.year());
    }

    setOpen(nextOpen);
  };

  const handleMonthSelect = (month: number) => {
    onChangeAction(dayjs.utc(`${viewYear}-${String(month).padStart(2, "0")}-01`).toDate());
    setOpen(false);
  };

  return (
    <div className={cn("relative w-56 max-w-full", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            aria-label={tProductDetail("month")}
            className={cn(
              "h-10 w-full justify-start rounded-lg border-input bg-card px-3 text-sm hover:border-primary hover:bg-transparent focus-visible:border-primary",
              open && "border-primary"
            )}
          >
            <Calendar1 data-icon="inline-start" className="shrink-0 text-muted-foreground" />
            <span className="truncate font-medium">{selected.format("MM/YYYY")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={4} className="w-56 max-w-none gap-0 rounded-[18px] p-4">

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">{viewYear}</span>
            <div className="flex items-center gap-2">
              {viewYear > currentYear && (
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label={tProductDetail("previousYear")}
                  onClick={() => setViewYear(viewYear - 1)}
                >
                  <ChevronLeft data-icon="inline-start" />
                </Button>
              )}
              <Button variant="secondary" size="icon" aria-label={tProductDetail("nextYear")} onClick={() => setViewYear(viewYear + 1)}>
                <ChevronRight data-icon="inline-start" />
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {monthOptions.map((option) => {
              const month = Number(option.value);
              const isSelected = selected.month() + 1 === month && selected.year() === viewYear;
              const candidate = dayjs.utc(`${viewYear}-${String(month).padStart(2, "0")}-01`);
              const isDisabled = candidate.isBefore(currentMonth, "month");

              return (
                <Button
                  key={option.value}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "min-w-0 justify-center font-semibold text-muted-foreground",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                  disabled={isDisabled}
                  onClick={() => handleMonthSelect(month)}
                >
                  <span className="truncate">{option.label}</span>
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RentalAvailabilityMonthPicker;
