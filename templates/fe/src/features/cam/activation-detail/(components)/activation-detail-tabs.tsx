import { TabsUrl } from "@/shared/components/ui/tabs-url";
import { TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import OverviewTab from "./tabs/overview-tab";
import { ActivationDetail } from "../../(hooks)/use-activation-detail";
import BriefingSummaryTab from "./tabs/briefing-summary-tab";
import CommunicationTab from "./tabs/communication-tab";
import ScoringTab from "./tabs/scoring-tab";
import ActivityTab from "./tabs/activity-tab";
import { useTranslations } from "next-intl";

type Props = {
  activationDetail: ActivationDetail;
  /** Admin-only evaluation tab — shown on the full detail page, hidden in the drawer. */
  showScoring?: boolean;
  showActivity?: boolean;
  showBriefing?: boolean;
}

const ActivationDetailTabs = ({
  activationDetail,
  showScoring = false,
  showActivity = false,
  showBriefing = true,
}: Props) => {
  const t = useTranslations('activationView');

  return (
    <TabsUrl defaultValue="overview" paramName="activationTab" keepParams={true} className="w-full">
      <TabsList variant="line">
        <TabsTrigger value="overview">{t('drawer.tabs.overview')}</TabsTrigger>
        {showBriefing && <TabsTrigger value="briefing">{t('drawer.tabs.briefing')}</TabsTrigger>}
        {showScoring && <TabsTrigger value="scoring">{t('drawer.tabs.scoring')}</TabsTrigger>}
        {showActivity && <TabsTrigger value="activity">{t('drawer.tabs.activity')}</TabsTrigger>}
        <TabsTrigger value="communication">{t('drawer.tabs.communication')}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-2">
        <OverviewTab activationDetail={activationDetail} />
      </TabsContent>
      {showBriefing && (
        <TabsContent value="briefing" className="mt-2">
          <BriefingSummaryTab activationDetail={activationDetail} />
        </TabsContent>
      )}
      {showScoring && (
        <TabsContent value="scoring" className="mt-2">
          <ScoringTab activationDetail={activationDetail} />
        </TabsContent>
      )}
      {showActivity && (
        <TabsContent value="activity" className="mt-2">
          <ActivityTab activationDetail={activationDetail} />
        </TabsContent>
      )}
      <TabsContent value="communication" className="mt-2">
        <CommunicationTab activationDetail={activationDetail} />
      </TabsContent>
    </TabsUrl>
  );
}

export default ActivationDetailTabs;
