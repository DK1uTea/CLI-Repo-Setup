'use client';

import { TabsUrl } from "@/shared/components/ui/tabs-url";
import ReportingToolHeader from "./reporting-tool-header";
import { TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Calendar, ChartColumnBig, FileText, SquarePen, Users } from "lucide-react";
import EventOverviewMain from "../event-overview/(components)/event-overview-main";
import { useTranslations } from "next-intl";
import AnswersOverviewMain from "../answers-overview/(components)/answers-overview-main";
import LeadsMain from "../leads/(components)/leads-main";
import EventAnalyticsMain from "../event-analytics/(components)/event-analytics-main";
import SurveyBuilderMain from "../survey-builder/(components)/survey-builder-main";

const ReportingToolMain = () => {
  const t = useTranslations("reportingTool.tabs");

  return (
    <div className="flex flex-col gap-4">
      <ReportingToolHeader />
      <TabsUrl defaultValue="dashboard" paramName="tab" keepParams={['eventId']}>
        <TabsList variant="line">
          <TabsTrigger value="dashboard" className="px-4 py-3"><Calendar />{t("dashboard")}</TabsTrigger>
          <TabsTrigger value="survey-builder" className="px-4 py-3"><SquarePen />{t("surveyBuilder")}</TabsTrigger>
          <TabsTrigger value="reports" className="px-4 py-3"><FileText />{t("answers")}</TabsTrigger>
          <TabsTrigger value="leads" className="px-4 py-3"><Users />{t("leads")}</TabsTrigger>
          <TabsTrigger value="analytics" className="px-4 py-3"><ChartColumnBig />{t("analytics")}</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <EventOverviewMain />
        </TabsContent>
        <TabsContent value="survey-builder">
          <SurveyBuilderMain />
        </TabsContent>
        <TabsContent value="reports">
          <AnswersOverviewMain />
        </TabsContent>
        <TabsContent value="leads">
          <LeadsMain />
        </TabsContent>
        <TabsContent value="analytics">
          <EventAnalyticsMain />
        </TabsContent>
      </TabsUrl>
    </div>
  );
}

export default ReportingToolMain;
