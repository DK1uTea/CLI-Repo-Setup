import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty";
import { ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";

const SurveyBuilderMainEmpty = () => {
  const t = useTranslations("reportingTool.surveyBuilder");

  return (
    <div className="py-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ClipboardList />
          </EmptyMedia>
          <EmptyTitle>{t("noDataTitle")}</EmptyTitle>
          <EmptyDescription>{t("noDataDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
};

export default SurveyBuilderMainEmpty;
