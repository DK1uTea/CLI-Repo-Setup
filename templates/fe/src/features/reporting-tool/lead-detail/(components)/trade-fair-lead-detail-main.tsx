'use client';

import { parseAsString, useQueryState } from "nuqs";
import { useGetLeadDetail } from "../(hooks)/use-get-lead-detail";
import TradeFairLeadDetailHeader from "./trade-fair-lead-detail-header";
import LeadDetail from "./lead-detail";
import LeadDetailSkeleton from "./lead-detail-skeleton";
import LeadDetailNoData from "./lead-detail-nodata";

const TradeFairLeadDetailMain = () => {
  const [leadId] = useQueryState("id", parseAsString);
  const [eventId] = useQueryState("eventId", parseAsString);
  const { leadDetail, isLoading } = useGetLeadDetail(leadId ?? "");

  if (isLoading) {
    return <LeadDetailSkeleton />;
  }

  if (!leadDetail) {
    return <LeadDetailNoData />;
  }

  return (
    <div className="flex flex-col w-full gap-6">
      <TradeFairLeadDetailHeader leadName={leadDetail.fullName} eventId={eventId ?? ""} />
      <LeadDetail lead={leadDetail} />
    </div>
  );
};

export default TradeFairLeadDetailMain;
