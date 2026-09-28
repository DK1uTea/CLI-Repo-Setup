import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty";
import { ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";

import { Survey } from "../../(helpers)/trade-fair-event-type";
import { PaginationType } from "@/shared/types/pagination-type";
import SurveyItemCard from "./survey-item-card";
import SurveyItemCardSkeleton from "./survey-item-card-skeleton";
import SurveyLibraryPagination from "./survey-library-pagination";

type Props = {
  surveys: Survey[];
  isLoading: boolean;
  pagination?: PaginationType;
  onPageChange: (page: number) => void;
}

const SurveyLibrary = ({ surveys, isLoading, pagination, onPageChange }: Props) => {
  const t = useTranslations("reportingTool.surveyBuilder");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-semibold text-lg">{t("surveyLibraryTitle")}</p>
        {Array.from({ length: 3 }).map((_, index) => (
          <SurveyItemCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-semibold text-lg">{t("surveyLibraryTitle")}</p>
      {surveys.length > 0 ? (
        <>
          <div className="flex flex-col gap-4">
            {surveys.map((survey) => (
              <SurveyItemCard key={survey.id} survey={survey} />
            ))}
          </div>
          {pagination && (
            <SurveyLibraryPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalCount={pagination.total}
              onPageChange={onPageChange}
            />
          )}
        </>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>{t("noAvailableSurveysTitle")}</EmptyTitle>
            <EmptyDescription>{t("noAvailableSurveysDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

export default SurveyLibrary;
