'use client'

import { parseAsString, useQueryState } from "nuqs";
import { useGetAnswerDetail } from "../(hook)/use-get-answer-detail";
import TradeFairAnswerDetailHeader from "./trade-fair-answer-detail-header";
import UserCreateInfo from "./user-create-info";
import LeadInfo from "./lead-infor";
import AnswerDetail from "./answer-detail";
import AnswerDetailSkeleton from "./answer-detail-skeleton";
import AnswerDetailNoData from "./answer-detail-nodata";
import { AnswerLead } from "../../(helpers)/trade-fair-answer-type";

const TradeFairAnswerDetailMain = () => {
  const [answerId] = useQueryState("id", parseAsString);
  const [eventId] = useQueryState("eventId", parseAsString);
  const { answerDetail, isLoading } = useGetAnswerDetail(answerId ?? "");

  if (isLoading) {
    return <AnswerDetailSkeleton />;
  }

  if (!answerDetail) {
    return <AnswerDetailNoData />;
  }

  const mappedLead: AnswerLead = {
    id: answerDetail.id,
    firstName: answerDetail.contact.firstName,
    lastName: answerDetail.contact.lastName,
    fullName: `${answerDetail.contact.firstName} ${answerDetail.contact.lastName}`.trim(),
    company: answerDetail.contact.company,
    phone: answerDetail.contact.phoneNumber,
    email: answerDetail.contact.email,
    address: answerDetail.contact.streetAndHouseNumber,
    zipCode: answerDetail.contact.postalCode,
    city: answerDetail.contact.city,
    status: "NEW",
    source: "manual",
    salutation: answerDetail.contact.salutation,
    function: answerDetail.contact.function,
    createdAt: {},
    updatedAt: {},
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <TradeFairAnswerDetailHeader leadName={mappedLead.fullName} eventId={eventId || ""} />
      <UserCreateInfo
        user={answerDetail.user}
        createdAt={answerDetail.createdAt}
        status={answerDetail.status}
        eventId={eventId || ""}
        answerId={answerId ?? undefined}
      />
      <LeadInfo lead={mappedLead} survey={answerDetail.survey} />
      <AnswerDetail answerDetail={answerDetail} />
    </div>
  );
}

export default TradeFairAnswerDetailMain;