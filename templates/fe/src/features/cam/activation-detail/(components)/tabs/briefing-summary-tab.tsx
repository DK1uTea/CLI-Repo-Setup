import { ActivationDetail } from "../../../(hooks)/use-activation-detail";
import ActivationDetailBriefing from "../activation-detail-briefing-summary/activation-detail-briefing";
type Props = {
  activationDetail: ActivationDetail;
};

const BriefingSummaryTab = ({ activationDetail }: Props) => {
  return (
    <ActivationDetailBriefing activationDetail={activationDetail} />
  );
}

export default BriefingSummaryTab;