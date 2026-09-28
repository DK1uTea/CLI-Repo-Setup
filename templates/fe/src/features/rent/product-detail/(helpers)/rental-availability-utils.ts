import { dayjs, nowUtc } from "@/lib/date-utils";

export type ProductCalendarItem = {
  day_of_month: number;
  availability: number;
};

export type RentalAvailabilityApiItem = {
  dayOfMonth: number;
  availability: number;
};

export function mapRentalAvailabilityItems(value: unknown): ProductCalendarItem[] {
  if (!Array.isArray(value)) return [];

  return (value as RentalAvailabilityApiItem[]).map((item) => ({
    day_of_month: item.dayOfMonth,
    availability: item.availability,
  }));
}

export function getRentalAvailabilityMonthOptions(locale: string) {
  const currentYear = dayjs.utc(nowUtc()).year();

  return Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: dayjs.utc(`${currentYear}-${String(index + 1).padStart(2, "0")}-01`).locale(locale).format("MMM"),
  }));
}
