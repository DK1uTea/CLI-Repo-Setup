'use client';

import { parseAsString, useQueryState } from "nuqs";

import { useEventDetail } from "../../(hooks)/use-event-detail";
import { AnswersTable } from "./answers-table";
import AnswersSearchFilter from "./answers-search-filter";
import TradeFairEventCard from "../../(components)/trade-fair-event-card";
import AnswersOverviewMainNoData from "./answers-overview-main-no-data";
import AnswersOverviewMainSkeleton from "./answers-overview-main-skeleton";
import { useAnswersList } from "../(hooks)/use-answers-list";
import AnswersPagination from "./answers-pagination";

const AnswersOverviewMain = () => {
  const [eventId] = useQueryState("eventId", parseAsString);
  const { eventDetail, isLoading: isEventDetailLoading } = useEventDetail(eventId ?? "");
  const { answers, isLoading: isAnswersLoading, page, limit, totalCount, setFilters } = useAnswersList();

  if (isEventDetailLoading) {
    return <AnswersOverviewMainSkeleton />;
  }

  if (!eventDetail) {
    return <AnswersOverviewMainNoData />;
  }

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const handleLimitChange = (newLimit: string) => {
    setFilters({ limit: Number(newLimit), page: 1 });
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <TradeFairEventCard event={eventDetail} />
      <AnswersSearchFilter />
      <AnswersTable answers={answers} isLoading={isAnswersLoading} />
      <AnswersPagination
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}

export default AnswersOverviewMain;
