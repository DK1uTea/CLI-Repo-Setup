import { ActivationDetail } from "../../../(hooks)/use-activation-detail";
import ActivationDetailOverview from "../activation-detail-overview/activation-detail-overview";

type Props = {
  activationDetail: ActivationDetail;
};

const OverviewTab = ({ activationDetail }: Props) => {
  return (
    <ActivationDetailOverview activationDetail={activationDetail} />
  );
}

export default OverviewTab;