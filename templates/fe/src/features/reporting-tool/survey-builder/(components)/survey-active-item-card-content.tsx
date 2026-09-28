"use client";

import { Check, Link, PlusIcon, UserRoundPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import SurveyActionsDropdown from "../../(components)/(survey-components)/survey-actions-dropdown";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/shared/components/ui/avatar";
import { useTranslations } from "next-intl";
import { EventSurvey } from "../../(helpers)/trade-fair-event-type";
import { SurveyAction } from "../../(components)/(survey-components)/survey-action-alert-dialog";
import RequiredLoginAlertDialog from "../../(components)/(survey-components)/required-login-alert-dialog";
import ShareInviteLinkDialog from "../../(components)/(assign-team-components)/share-invite-link-dialog";

type Assignment = EventSurvey["assignments"][number];

type Props = {
  eventSurvey: EventSurvey;
  hasAssignments: boolean;
  assignments: Assignment[];
  remainingAssignmentsCount: number;
  openAssignUsersDialog: () => void;
  setDialogAction: (action: SurveyAction | undefined) => void;
  disabled?: boolean;
  isUnassigning?: boolean;
};

const avatarFallbackColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

const getUserInitials = (assignment: Assignment) => {
  const user = assignment.user;
  if (!user) return "";
  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((name) => name.charAt(0))
    .join("");

  return (initials || user.email.charAt(0)).slice(0, 2).toUpperCase();
};

const getAvatarFallbackColor = (assignment: Assignment) => {
  const user = assignment.user;
  if (!user) return avatarFallbackColors[0];
  const value = assignment.userId || user.email;
  const colorIndex = Array.from(value).reduce((sum: number, character: string) => (
    sum + character.charCodeAt(0)
  ), 0) % avatarFallbackColors.length;

  return avatarFallbackColors[colorIndex];
};

export const SurveyActiveItemCardContent = ({
  eventSurvey,
  hasAssignments,
  assignments,
  remainingAssignmentsCount,
  openAssignUsersDialog,
  setDialogAction,
  disabled = false,
  isUnassigning = false,
}: Props) => {
  const t = useTranslations("reportingTool.surveyBuilder");
  const assignTeamT = useTranslations("reportingTool.tradeFairEventForm.assignTeam");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 grow">
          <p className="truncate font-semibold text-lg text-primary">{eventSurvey.name}</p>
          <p className="text-primary">{t("questions", { count: eventSurvey.totalQuestions ?? 0 })}</p>
        </div>

        {!eventSurvey.requiredLogin && (
          <ShareInviteLinkDialog
            eventSurveyId={eventSurvey.eventSurveyId}
            requiredLogin={false}
          >
            <Button
              variant="outline-primary"
              className="hidden bg-card lg:inline-flex"
            >
              {assignTeamT("shareLink")}
              <Link data-icon="inline-end" />
            </Button>
          </ShareInviteLinkDialog>
        )}
        {eventSurvey.requiredLogin && !hasAssignments && (
          <Button
            variant="outline-primary"
            className="hidden bg-card lg:inline-flex"
            disabled={disabled}
            onClick={openAssignUsersDialog}
          >
            <UserRoundPlus data-icon="inline-start" />
            {t("assignUsers")}
          </Button>
        )}
        {eventSurvey.requiredLogin && hasAssignments && (
          <div className="hidden items-center gap-2 lg:flex">
            <Button
              variant="ghost"
              className="h-auto p-0"
              onClick={openAssignUsersDialog}
            >
              <AvatarGroup>
                {assignments.map((assignment) => (
                  <Avatar key={assignment.id} size="lg">
                    <AvatarFallback className={`font-semibold text-card ${getAvatarFallbackColor(assignment)}`}>
                      {getUserInitials(assignment)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <AvatarGroupCount className="bg-card">
                  <PlusIcon className="text-primary" />
                </AvatarGroupCount>
              </AvatarGroup>
            </Button>
            {remainingAssignmentsCount > 0 && (
              <span className="text-sm text-primary">
                {t("moreUsers", { count: remainingAssignmentsCount })}
              </span>
            )}
          </div>
        )}
        <Button
          className="hidden lg:inline-flex"
          disabled={disabled}
          // Radix's AlertDialogAction closes the confirm dialog synchronously
          // on click, well before the mutation settles — this persistent
          // button is what's actually still on screen to show progress.
          isLoading={isUnassigning}
          onClick={() => setDialogAction("unassign")}
        >
          <Check data-icon="inline-start" />
          {t("unassignSurvey")}
        </Button>
        <RequiredLoginAlertDialog eventSurveyId={eventSurvey.eventSurveyId} requiredLogin={eventSurvey.requiredLogin} />
        <SurveyActionsDropdown
          surveyId={eventSurvey.id}
          onActionChange={setDialogAction}
          canEdit={eventSurvey.canEdit}
          disabled={disabled}
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 lg:hidden">
        {!eventSurvey.requiredLogin && (
          <ShareInviteLinkDialog
            eventSurveyId={eventSurvey.eventSurveyId}
            requiredLogin={false}
          >
            <Button variant="outline-primary" className="bg-card">
              {assignTeamT("shareLink")}
              <Link data-icon="inline-end" />
            </Button>
          </ShareInviteLinkDialog>
        )}
        {eventSurvey.requiredLogin && !hasAssignments && (
          <Button
            variant="outline-primary"
            onClick={openAssignUsersDialog}
            className="bg-card"
            disabled={disabled}
          >
            <UserRoundPlus data-icon="inline-start" />
            {t("assignUsers")}
          </Button>
        )}
        {eventSurvey.requiredLogin && hasAssignments && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-auto p-0"
              onClick={openAssignUsersDialog}
            >
              <AvatarGroup>
                {assignments.map((assignment) => (
                  <Avatar key={assignment.id} size="lg">
                    <AvatarFallback className={`font-semibold text-card ${getAvatarFallbackColor(assignment)}`}>
                      {getUserInitials(assignment)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <AvatarGroupCount className="bg-card">
                  {remainingAssignmentsCount > 0 ? (
                    <span className="text-sm font-semibold text-primary">
                      +{remainingAssignmentsCount}
                    </span>
                  ) : (
                    <PlusIcon className="text-primary" />
                  )}
                </AvatarGroupCount>
              </AvatarGroup>
            </Button>
          </div>
        )}
        <Button disabled={disabled} isLoading={isUnassigning} onClick={() => setDialogAction("unassign")}>
          <Check data-icon="inline-start" />
          {t("unassignSurvey")}
        </Button>
      </div>
    </div>
  );
};
