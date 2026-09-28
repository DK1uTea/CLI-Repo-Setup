import { useState } from "react";
import { toast } from "sonner";
import { EventSurvey, UserEventSurvey } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Globe, Link, PlusIcon, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import AddUserDialog from "./add-user-dialog";
import ImportUsersDialog from "./import-users-dialog";
import ShareInviteLinkDialog from "./share-invite-link-dialog";
import UsersTable from "./users-table";
import UserEventSurveyPagination from "./user-event-survey-pagination";
import { useGetUserEventSurvey } from "@/features/reporting-tool/(hooks)/(survey-hooks)/use-get-user-event-survey";
import { useAddUser } from "@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-add-user";
import { useDeleteUser } from "@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-delete-user";
import { useChangeRoleUser } from "@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-change-role-user";
import { useImportUsers } from "@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-import-users";
import { AddUserFormValues } from "@/features/reporting-tool/(helpers)/add-user-schema";

import { parseAsString, useQueryState } from "nuqs";

type Props = {
  eventSurvey: EventSurvey;
}

const AssignTeamCard = ({ eventSurvey }: Props) => {
  const t = useTranslations("reportingTool.tradeFairEventForm.assignTeam");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState("5");

  const [eventIdParam] = useQueryState("eventId", parseAsString);
  const [idParam] = useQueryState("id", parseAsString);
  const eventId = eventIdParam || idParam || "";

  const { users, usersPagination, isLoading } = useGetUserEventSurvey(eventSurvey.eventSurveyId, {
    page,
    limit: Number(perPage),
  });

  const { addUser, isAdding } = useAddUser(eventSurvey.eventSurveyId, eventId);
  const { deleteUser } = useDeleteUser(eventSurvey.eventSurveyId, eventId);
  const { changeRole } = useChangeRoleUser(eventSurvey.eventSurveyId, eventId);
  const { importUsers, isImporting } = useImportUsers(eventSurvey.eventSurveyId, eventId);

  const handleAddUser = async (values: AddUserFormValues) => {
    try {
      await addUser(values);
      toast.success(t("addUserDialog.success"));
    } catch {
      // Error handled by API client interceptor
    }
  };

  const handleDeleteUser = async (assignmentId: string) => {
    try {
      await deleteUser(assignmentId);
      toast.success(t("removeUserSuccess"));
    } catch {
      // Error handled by API client interceptor
    }
  };

  const handleRoleChange = async (assignmentId: string, newRole: UserEventSurvey["role"]) => {
    try {
      await changeRole({
        users: [
          {
            id: assignmentId,
            role: newRole,
          },
        ],
      });
      toast.success(t("changeRoleSuccess"));
    } catch {
      // Error handled by API client interceptor
    }
  };

  const handleImportUsers = async (file: File) => {
    try {
      await importUsers(file);
      toast.success(t("importUsersSuccess"));
    } catch {
      // Error handled by API client interceptor
    }
  };

  const totalPages = usersPagination?.totalPages ?? 1;
  const totalCount = usersPagination?.total ?? 0;

  return (
    <Card className="py-8">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>{eventSurvey.name}</CardTitle>
            {!eventSurvey.requiredLogin && (
              <Badge variant="secondary" className="text-primary">
                <Globe data-icon="inline-start" />
                {t("publicSurvey")}
              </Badge>
            )}
          </div>
          {eventSurvey.requiredLogin && (
            <CardDescription>{t("description")}</CardDescription>
          )}
          {!eventSurvey.requiredLogin && (
            <CardDescription>{t("publicDescription")}</CardDescription>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <ShareInviteLinkDialog
            eventSurveyId={eventSurvey.eventSurveyId}
            requiredLogin={eventSurvey.requiredLogin}
          >
            <Button variant="outline-primary">
              {eventSurvey.requiredLogin ? t("shareInviteLink") : t("shareLink")}
              <Link data-icon="inline-end" />
            </Button>
          </ShareInviteLinkDialog>
          {eventSurvey.requiredLogin && (
            <ImportUsersDialog onImportUsers={handleImportUsers}>
              <Button variant="outline-primary" disabled={isImporting}>
                {t("importUsers")}
                <Upload data-icon="inline-end" />
              </Button>
            </ImportUsersDialog>
          )}
          {eventSurvey.requiredLogin && (
            <AddUserDialog onAddUser={handleAddUser}>
              <Button disabled={isAdding}>
                {t("addUser")}
                <PlusIcon data-icon="inline-end" />
              </Button>
            </AddUserDialog>
          )}
        </div>
      </CardHeader>
      {eventSurvey.requiredLogin && (
        <CardContent>
          <div className="flex flex-col gap-4">
            <UsersTable
              users={users}
              totalCount={totalCount}
              isLoading={isLoading}
              onDelete={handleDeleteUser}
              onRoleChange={handleRoleChange}
            />
            <UserEventSurveyPagination
              page={page}
              perPage={perPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default AssignTeamCard;
