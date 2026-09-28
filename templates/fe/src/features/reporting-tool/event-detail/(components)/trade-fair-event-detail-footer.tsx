'use client';

import { Button } from "@/shared/components/ui/button";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import DeleteEventAlertDialog from "../../(components)/delete-event-alert-dialog";

const TradeFairEventDetailFooter = () => {
  const eventCardT = useTranslations("reportingTool.eventCard");
  const [eventId] = useQueryState("id", parseAsString);

  if (!eventId) return null;

  return (
    <div className="sticky bottom-0 z-10 shrink-0 border-t border-border bg-card">
      <div className="flex flex-row gap-2 px-4 py-3 w-full sm:justify-end sm:gap-3 sm:px-6">
        <DeleteEventAlertDialog eventId={eventId}>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10 flex-1 sm:flex-initial"
          >
            {eventCardT("deleteEvent")}
          </Button>
        </DeleteEventAlertDialog>

        <Button
          href={`/reporting-tool/update-event?id=${eventId}&referrer=eventDetail`}
          className="flex-1 sm:flex-initial"
        >
          {eventCardT("editEvent")}
        </Button>
      </div>
    </div>
  );
};

export default TradeFairEventDetailFooter;