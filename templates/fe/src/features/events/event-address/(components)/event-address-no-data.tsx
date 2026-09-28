import { MapPinOff } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

const EventAddressNoData = () => {
  const t = useTranslations("events.address");

  return (
    <Empty>
      <EmptyMedia>
        <MapPinOff className="size-20 text-primary opacity-40" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>{t("noDataTitle")}</EmptyTitle>
        <EmptyDescription>{t("noDataDescription")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export default EventAddressNoData;
