import { useTranslations } from "next-intl";
import ForwardButton from "../../(components)/forward-button";

type Props = {
  eventId: string;
}

const TradeFairEventDetailHeader = ({ eventId }: Props) => {
  const t = useTranslations("reportingTool.header.titles");

  return (
    <div className="flex gap-4 items-center">
      <ForwardButton href={`/reporting-tool?eventId=${eventId}`} />
      <p className="font-semibold text-2xl">{t("eventDetail")}</p>
    </div>
  );
}

export default TradeFairEventDetailHeader;