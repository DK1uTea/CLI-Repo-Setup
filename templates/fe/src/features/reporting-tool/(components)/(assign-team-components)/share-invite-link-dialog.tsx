"use client";

import { CircleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import { useShareInviteLink } from "@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-share-invite-link";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import UserRoleRadioGroup from "./user-role-radio-group";

type ShareInviteLinkDialogProps = {
  children: ReactNode;
  eventSurveyId: string;
  requiredLogin?: boolean;
};

const ShareInviteLinkDialog = ({
  children,
  eventSurveyId,
  requiredLogin = true,
}: ShareInviteLinkDialogProps) => {
  const t = useTranslations("reportingTool.tradeFairEventForm.assignTeam.shareInviteLinkDialog");
  const [open, setOpen] = useState(false);
  const {
    role,
    inviteLink,
    isLoading,
    setRole,
    copyInviteLink,
  } = useShareInviteLink({
    eventSurveyId,
    enabled: open,
    requiredLogin,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-0 sm:max-w-xl">
        <form onSubmit={(event) => {
          event.preventDefault();
          void copyInviteLink();
        }}>
          <DialogHeader>
            <DialogTitle className="font-semibold text-xl">
              {requiredLogin ? t("titlePrivate") : t("title")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="share-invite-link">
                {requiredLogin ? t("inviteLinkPrivate") : t("inviteLink")}
              </Label>
              <Input
                id="share-invite-link"
                value={isLoading ? t("loading") : inviteLink}
                readOnly
                className="bg-muted/50 font-medium text-muted-foreground"
              />
            </div>

            <div className="flex gap-3 rounded-lg bg-muted/50 p-3 text-sm font-medium text-muted-foreground">
              <CircleAlertIcon className="mt-0.5 shrink-0" />
              <p>
                {requiredLogin ? t("description") : t("publicDescription")}
              </p>
            </div>

            {requiredLogin && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-semibold">{t("userRoles")}</h3>
                <UserRoleRadioGroup
                  idPrefix="share-invite-role"
                  value={role}
                  onValueChange={setRole}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline-primary">
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!inviteLink || isLoading}>
              {t("copyLink")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareInviteLinkDialog;
