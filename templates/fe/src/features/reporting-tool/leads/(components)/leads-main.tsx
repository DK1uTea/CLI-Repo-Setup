'use client';

import { parseAsString, useQueryState } from "nuqs";

import TradeFairEventCard from "../../(components)/trade-fair-event-card";
import { useEventDetail } from "../../(hooks)/use-event-detail";
import LeadsMainNoData from "./leads-main-no-data";
import LeadsMainSkeleton from "./leads-main-skeleton";
import LeadsSearchFilter from "./leads-search-filter";
import LeadsTable from "./leads-table";
import { useLeadsList } from "../(hooks)/use-leads-list";
import LeadsPagination from "./leads-pagination";

const LeadsMain = () => {
  const [eventId] = useQueryState("eventId", parseAsString);
  const { eventDetail, isLoading: isEventDetailLoading } = useEventDetail(eventId ?? "");
  const { leads, isLoading: isLeadsLoading, page, limit, totalCount, setFilters } = useLeadsList();

  if (isEventDetailLoading) {
    return <LeadsMainSkeleton />;
  }

  if (!eventDetail) {
    return <LeadsMainNoData />;
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
      <LeadsSearchFilter />
      <LeadsTable leads={leads} isLoading={isLeadsLoading} eventId={eventId ?? ""} />
      <LeadsPagination
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}

export default LeadsMain;
