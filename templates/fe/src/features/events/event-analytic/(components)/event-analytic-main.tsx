import DashboardCharts from "@/features/dashboard/(components)/dashboard-charts";
import EventAnalyticStats from "./event-analytic-stats";

const EventAnalyticMain = () => {
  return (
    <div className="flex flex-col gap-6">
      <EventAnalyticStats />
      <DashboardCharts />
    </div>
  );
}

export default EventAnalyticMain;