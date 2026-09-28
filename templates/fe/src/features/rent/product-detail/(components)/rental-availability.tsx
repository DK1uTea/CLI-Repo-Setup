'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";

import { dayjs, nowUtc } from "@/lib/date-utils";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { useEventRentalAvailability } from "@/features/events/product-detail/(hooks)/use-event-rental-availability";
import { useRentalAvailability } from "../(hooks)/use-rental-availability";
import type { ProductDetail } from "../(services)/product-detail-service";
import RentalAvailabilityCalendar from "./rental-availability-calendar";
import RentalAvailabilityMonthPicker from "./rental-availability-month-picker";

type Props =
  | { product: ProductDetail; source: 'rent' }
  | { product: ProductDetail; source: 'event'; eventId: string };

const RentalAvailability = (props: Props) => {
  const { product, source } = props;
  const eventId = source === 'event' ? props.eventId : '';
  const tCommon = useTranslations("common");
  const currentDate = nowUtc();
  const [month, setMonth] = useState(dayjs.utc(currentDate).month() + 1);
  const [year, setYear] = useState(dayjs.utc(currentDate).year());
  const rentAvailability = useRentalAvailability({
    slug: product.slug,
    month,
    year,
    enabled: source === 'rent',
  });
  const eventAvailability = useEventRentalAvailability({
    slug: product.slug,
    eventId,
    month,
    year,
    enabled: source === 'event',
  });
  const items = source === 'event'
    ? eventAvailability.data ?? []
    : rentAvailability.data ?? [];

  const handleMonthChange = (date: Date) => {
    const nextMonth = dayjs.utc(date);
    setMonth(nextMonth.month() + 1);
    setYear(nextMonth.year());
  };

  return (
    <Card className="w-full overflow-visible">
      <CardHeader className="flex">
        <RentalAvailabilityMonthPicker
          value={dayjs.utc(`${year}-${String(month).padStart(2, "0")}-01`).toDate()}
          onChangeAction={handleMonthChange}
        />
      </CardHeader>
      <CardContent>
        <RentalAvailabilityCalendar
          items={items}
          month={month}
          year={year}
          availabilityLabel={tCommon("availability")}
        />
      </CardContent>
    </Card>
  );
};

export default RentalAvailability;
