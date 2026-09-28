import { ActivationDetail } from "../../(hooks)/use-activation-detail";
import EvaluationBadge from "../../(components)/evaluation-badge";
import { ActivationStatusBadge } from "../../(components)/activation-status-badge";
import ImageCarousel from "./activation-image-carousel";
import DetailParticipants from "./activation-detail-participants";
import AddressedIssues from "./addressed-issues";
import ActivationDetailTabs from "./activation-detail-tabs";

type Props = {
  activationDetail: ActivationDetail;
  showScoring?: boolean;
  showActivity?: boolean;
  showBriefing?: boolean;
  showStatusBadge?: boolean;
}

/**
 * Shared "content" body — image carousel, summary info, participants and tabs.
 * Rendered by both the drawer (Sheet, non-admin roles) and the full detail page (admin).
 */
const ActivationDetailBody = ({
  activationDetail,
  showScoring = false,
  showActivity = false,
  showBriefing = true,
  showStatusBadge = false,
}: Props) => {
  const images = [
    ...(activationDetail.ahMarketMediaUrls?.map((m) => m.path) ?? []),
    ...(activationDetail.aMarketMediaUrls?.map((m) => m.path) ?? [])
  ];

  return (
    <div className="overflow-y-auto _custom-scroll">
      <div className="flex flex-col gap-4 px-10 pt-9 pb-4">
        <ImageCarousel
          images={images}
          activationId={activationDetail.id}
          isSubscribed={activationDetail.isSubscribed}
        />
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-semibold">{activationDetail.name}</p>
          <p className="text-muted-foreground">{activationDetail.store.address}</p>
          <div className="flex items-center gap-2">
            <EvaluationBadge evaluation={activationDetail.evaluation} />
            {showStatusBadge && <ActivationStatusBadge status={activationDetail.status} />}
          </div>
        </div>
        <DetailParticipants activationId={activationDetail.id} />
        <AddressedIssues activationId={activationDetail.id} />
      </div>
      {/* <div className="border-b border-border mx-10" /> */}
      <div className="pb-9 pt-4 px-10 flex gap-4">
        <ActivationDetailTabs
          activationDetail={activationDetail}
          showScoring={showScoring}
          showActivity={showActivity}
          showBriefing={showBriefing}
        />
      </div>
    </div>
  );
}

export default ActivationDetailBody;
