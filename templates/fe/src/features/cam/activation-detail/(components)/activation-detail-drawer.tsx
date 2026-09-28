import { Button } from "@/shared/components/ui/button";
import { useUserStore } from "@/shared/stores/use-user-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import { useActivationDetailDrawerUrl } from "../(hooks)/use-activation-detail-drawer-url";
import { useActivationDetail } from "../../(hooks)/use-activation-detail";
import { useGetActivationFeedbacks } from "../(hooks)/use-get-activation-feedbacks";
import { ActivationStatusBadge } from "../../(components)/activation-status-badge";
import { X } from "lucide-react";
import ActivationDetailBody from "./activation-detail-body";
import ActivationDetailFooter from "./activation-detail-footer";
import FeedbackDrawer from "./feedback-drawer/feedback-drawer";
import ParticipantsDrawer from "./participants-drawer/participants-drawer";
import { canViewActivationActivity, canViewActivationBriefing } from "../(helpers)/activation-detail-permissions";

import { useTranslations } from "next-intl";
import DetailDrawerSkeleton from "./detail-drawer-skeleton";
import DetailDrawerNoData from "./detail-drawer-no-data";

/**
 * Mount this exactly ONCE per page (e.g. alongside the list/board it belongs to).
 * It is purely URL-driven — open it from anywhere via `useActivationDetailDrawerUrl().openDrawer(id)`,
 * never by wrapping a trigger in another instance of this component (that mounts a second Sheet
 * that reacts to the same shared URL state, which stacks duplicate overlays).
 */
const ActivationDetailDrawer = () => {
  const t = useTranslations('activationView');
  const { open, activationId, closeDrawer } = useActivationDetailDrawerUrl();
  const permissions = useUserStore((state) => state.permissions);
  const showActivity = canViewActivationActivity(permissions);
  const showBriefing = canViewActivationBriefing(permissions);

  const { data: activationDetail, isLoading } = useActivationDetail(activationId ?? undefined);
  useGetActivationFeedbacks(activationId ?? undefined);

  return (
    <>
      <Sheet open={open} onOpenChange={(next) => !next && closeDrawer()}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:min-w-120 flex flex-col gap-0 p-0"
        >
          <SheetHeader className="border-b border-border px-4 py-2">
            <SheetTitle className="sr-only">{t('drawer.title')}</SheetTitle>
            <div className="flex items-center justify-between gap-2">
              <ActivationStatusBadge status={activationDetail?.status ?? ""} />
              <Button variant="ghost" size="icon" onClick={closeDrawer}>
                <X data-icon="inline start" className="text-primary" />
              </Button>
            </div>
          </SheetHeader>
          <div className="flex-1 min-h-0 overflow-y-auto _custom-scroll">
            {isLoading && <DetailDrawerSkeleton />}
            {!isLoading && activationDetail && (
              <ActivationDetailBody
                activationDetail={activationDetail}
                showActivity={showActivity}
                showBriefing={showBriefing}
              />
            )}
            {!isLoading && !activationDetail && <DetailDrawerNoData />}
          </div>
          {activationDetail && (
            <ActivationDetailFooter activationDetail={activationDetail} onStatusChanged={closeDrawer} />
          )}
        </SheetContent>
      </Sheet>
      <FeedbackDrawer activationId={activationId ?? undefined} status={activationDetail?.status} />
      <ParticipantsDrawer activationId={activationId ?? undefined} />
    </>
  );
}

export default ActivationDetailDrawer;
