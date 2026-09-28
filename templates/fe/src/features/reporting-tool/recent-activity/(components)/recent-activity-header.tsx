import { useTranslations } from "next-intl";
import ForwardButton from "../../(components)/forward-button";

type Props = {
  eventId?: string | null;
};

const RecentActivityHeader = ({ eventId }: Props) => {
  const t = useTranslations("reportingTool.eventOverview.activities");

  return (
    <div className="flex items-center gap-3">
      <ForwardButton href={eventId ? `/reporting-tool?eventId=${eventId}` : "/reporting-tool"} />
      <h1 className="text-2xl font-semibold">{t("pageTitle")}</h1>
    </div>
  );
};

export default RecentActivityHeader;
