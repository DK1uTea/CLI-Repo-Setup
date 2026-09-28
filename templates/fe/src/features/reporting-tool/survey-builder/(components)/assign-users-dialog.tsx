"use client";

import { EventSurvey } from "../../(helpers)/trade-fair-event-type";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { useTranslations } from "next-intl";
import AssignTeamCard from "../../(components)/(assign-team-components)/assign-team-card";

type Props = {
  eventSurvey: EventSurvey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AssignUsersDialog = ({ eventSurvey, open, onOpenChange }: Props) => {
  const t = useTranslations("reportingTool.surveyBuilder");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto _custom-scroll p-0 sm:max-w-150 lg:max-w-200">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("assignUsers")}</DialogTitle>
          <DialogDescription>{t("assignUsersDescription", { name: eventSurvey.name })}</DialogDescription>
        </DialogHeader>
        <AssignTeamCard eventSurvey={eventSurvey} />
      </DialogContent>
    </Dialog>
  );
}

export default AssignUsersDialog;
