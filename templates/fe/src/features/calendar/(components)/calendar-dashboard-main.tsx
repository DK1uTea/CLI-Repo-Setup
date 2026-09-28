import { CalendarListMain } from "../calendar-list/(components)/calendar-list-main";
import CalendarDashboardHeader from "./calendar-dashboard-header";
import { Card, CardContent, CardTitle } from "@/shared/components/ui/card";
import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";

const CalendarDashboardMain = () => {
  const t = useTranslations("events");

  return (
    <div className="flex flex-col gap-8">
      <CalendarDashboardHeader />
      <Card>
        <CardTitle className="flex items-center gap-2 px-5 text-2xl">
          <CalendarDays className="h-7 w-7" /> {t("title")}
        </CardTitle>
        <CardContent>
          <CalendarListMain />
        </CardContent>
      </Card>
    </div>
  );
}

export default CalendarDashboardMain;
