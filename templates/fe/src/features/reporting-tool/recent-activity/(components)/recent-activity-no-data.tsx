import { Empty, EmptyDescription, EmptyHeader } from "@/shared/components/ui/empty";
import { useTranslations } from "next-intl";

const RecentActivityNoData = () => {
  const t = useTranslations("reportingTool.eventOverview.activities");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyDescription className="italic">
          {t("noDataDescription")}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export default RecentActivityNoData;
