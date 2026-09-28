import { ActivationDetail } from "../../../(hooks)/use-activation-detail";
import ActivationCommunication from "../activation-communication/activation-communication";

type Props = {
  activationDetail: ActivationDetail;
};

const CommunicationTab = ({ activationDetail }: Props) => {
  return <ActivationCommunication activationId={activationDetail.id} />;
}

export default CommunicationTab;
