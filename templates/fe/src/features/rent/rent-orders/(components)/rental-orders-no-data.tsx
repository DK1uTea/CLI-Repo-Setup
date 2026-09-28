import { ClipboardListIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

const RentalOrdersNoData = () => {
  const t = useTranslations("rent.rentOrders");

  return (
    <Empty>
      <EmptyMedia>
        <ClipboardListIcon className="size-20 text-primary opacity-40" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>{t("noDataTitle")}</EmptyTitle>
        <EmptyDescription>{t("noDataDescription")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export default RentalOrdersNoData;
