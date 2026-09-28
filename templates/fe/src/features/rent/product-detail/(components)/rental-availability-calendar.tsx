'use client';

import { useLocale, useTranslations } from "next-intl";

import { dayjs } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { ProductCalendarItem } from "../(helpers)/rental-availability-utils";

type Props = {
  items: ProductCalendarItem[];
  month: number;
  year: number;
  availabilityLabel: string;
};

const RentalAvailabilityCalendar = ({ items, month, year, availabilityLabel }: Props) => {
  const locale = useLocale();
  const tDatePicker = useTranslations("datePicker.weekdays");
  const userTimezone = dayjs.tz.guess();
  const today = dayjs().tz(userTimezone);

  const dayLabels = [
    tDatePicker("su"),
    tDatePicker("mo"),
    tDatePicker("tu"),
    tDatePicker("we"),
    tDatePicker("th"),
    tDatePicker("fr"),
    tDatePicker("sa"),
  ];

  const firstDay = dayjs.tz(`${year}-${String(month).padStart(2, "0")}-01`, userTimezone);
  const start = firstDay.startOf("week");
  const end = firstDay.endOf("month").endOf("week");
  const dates: string[] = [];

  for (let date = start.clone(); date.isSame(end) || date.isBefore(end); date = date.add(1, "day")) {
    dates.push(date.format("YYYY-MM-DD"));
  }

  const weeks = Array.from({ length: Math.ceil(dates.length / 7) }, (_, index) => dates.slice(index * 7, index * 7 + 7));

  const dayMap = items.reduce<Record<number, ProductCalendarItem>>((map, item) => {
    map[item.day_of_month] = item;
    return map;
  }, {});

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="min-w-lg overflow-hidden rounded-lg border border-border sm:min-w-0">
        <div className="grid grid-cols-7 border-b border-border">
          {dayLabels.map((day) => (
            <div key={day} className="px-2 py-3 text-center text-xs font-semibold uppercase text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="flex flex-col divide-y divide-border">
          {weeks.map((week) => (
            <div key={week.join("-")} className="grid grid-cols-7 divide-x divide-border">
              {week.map((dateString) => {
                const date = dayjs.tz(dateString, "YYYY-MM-DD", userTimezone);
                const isCurrentMonth = date.month() + 1 === month && date.year() === year;
                const isToday = today.isSame(date, "day");
                const isPast = date.isBefore(today, "day");
                const item = isCurrentMonth ? dayMap[date.date()] : undefined;
                const hasAvailability = !!item && !isPast;
                const isUnavailable = hasAvailability && item.availability === 0;

                return (
                  <div
                    key={dateString}
                    className={cn(
                      "relative flex min-h-20 min-w-0 flex-col p-2 transition-colors sm:aspect-[1.35] sm:min-h-0",
                      !isCurrentMonth && "bg-muted/30",
                      isToday && "outline-2 -outline-offset-1 outline-primary",
                      isPast && isCurrentMonth && "opacity-50",
                      hasAvailability && !isUnavailable && "bg-success/10",
                      isUnavailable && "bg-destructive/5"
                    )}
                  >
                    <span
                      className={cn(
                        "self-end text-xs font-medium leading-none",
                        isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                        isToday && "font-bold text-primary"
                      )}
                    >
                      {date.locale(locale).date()}
                    </span>

                    {hasAvailability && (
                      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1">
                        <span className={cn("text-xl font-bold leading-none sm:text-2xl", isUnavailable ? "text-destructive" : "text-success")}>
                          {item.availability}
                        </span>
                        <span className="max-w-full truncate text-xs font-medium text-muted-foreground">{availabilityLabel}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RentalAvailabilityCalendar;
