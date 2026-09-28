import { ActivationDetail } from "../../../(hooks)/use-activation-detail";
import ActivationActivity from "../activation-activity/activation-activity";

type Props = {
  activationDetail: ActivationDetail;
};

const ActivityTab = ({ activationDetail }: Props) => {
  return <ActivationActivity activationId={activationDetail.id} />;
}

export default ActivityTab;
