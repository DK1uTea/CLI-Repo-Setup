"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useGetUserEventSurvey } from "@/features/reporting-tool/(hooks)/(survey-hooks)/use-get-user-event-survey";
import type { EventSurvey, UserEventSurvey } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/shared/components/ui/table";
import { Globe, Pencil } from "lucide-react";
import { useTradeFairEventActions } from "../../../(hooks)/use-trade-fair-event-action";
import { usePathname } from "@/i18n/navigation";
import { parseAsString, useQueryState } from "nuqs";
import SurveyAssignTeamPagination from "./survey-assign-team-pagination";
import SurveyAssignTeamRowsSkeleton from "./survey-assign-team-rows-skeleton";
import { Separator } from "@/shared/components/ui/separator";

type Props = {
  eventSurvey: EventSurvey;
}

const roleLabelKeys: Record<UserEventSurvey["role"], "promoter" | "salesRep" | "admin"> = {
  PROMOTER: "promoter",
  SALES_REP: "salesRep",
  ADMIN: "admin",
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

const getUserName = (user: UserEventSurvey) => {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
};

const getUserInitials = (user: UserEventSurvey) => {
  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((name) => name.charAt(0))
    .join("");

  return (initials || user.email.charAt(0)).slice(0, 2).toUpperCase();
};

const getAvatarFallbackColor = (user: UserEventSurvey) => {
  const value = user.id || user.email;
  const colorIndex = Array.from(value).reduce((sum, character) => (
    sum + character.charCodeAt(0)
  ), 0) % avatarFallbackColors.length;

  return avatarFallbackColors[colorIndex];
};

const SurveyAssignTeamCard = ({ eventSurvey }: Props) => {
  const reviewT = useTranslations("reportingTool.tradeFairEventForm.reviewLaunch");
  const assignTeamT = useTranslations("reportingTool.tradeFairEventForm.assignTeam");
  const surveyT = useTranslations("reportingTool.tradeFairEventForm.survey");
  const [perPage, setPerPage] = useState("5");
  const [page, setPage] = useState(1);
  const { users, usersPagination, isLoading } = useGetUserEventSurvey(eventSurvey.eventSurveyId, {
    page,
    limit: Number(perPage),
  });
  const { goToStep } = useTradeFairEventActions();
  const pathname = usePathname();
  const [eventId] = useQueryState("id", parseAsString);

  const isEventDetail = pathname === "/reporting-tool/event-detail";

  const totalPages = usersPagination?.totalPages ?? 1;
  const visibleUsers = users;

  const handlePerPageChange = (value: string) => {
    setPerPage(value);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>{eventSurvey.name}</CardTitle>
            {!eventSurvey.requiredLogin && (
              <Badge variant="secondary" className="text-primary">
                <Globe data-icon="inline-start" />
                {assignTeamT("publicSurvey")}
              </Badge>
            )}
          </div>
          <CardDescription>{surveyT("questions", { count: eventSurvey.totalQuestions ?? 0 })}</CardDescription>
        </div>
        <Button
          variant="outline-primary"
          className="w-full lg:w-fit"
          href={isEventDetail && eventId ? `/reporting-tool/update-event?id=${eventId}&step=survey&referrer=eventDetail` : undefined}
          onClick={isEventDetail ? undefined : () => goToStep("survey")}
        >
          {isEventDetail ? reviewT("editDetails") : reviewT("edit")} <Pencil data-icon="inline-end" />
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4">
        {eventSurvey.requiredLogin ? (
          <>
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="flex flex-col gap-3 border-b border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                {isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <p>{reviewT("assignTeam.users", { count: usersPagination?.total ?? 0 })}</p>
                )}
                <Button
                  variant="outline-primary"
                  className="w-full sm:w-fit"
                  href={isEventDetail && eventId ? `/reporting-tool/update-event?id=${eventId}&step=assign-team&referrer=eventDetail` : undefined}
                  onClick={isEventDetail ? undefined : () => goToStep("assign-team")}
                >
                  {isEventDetail ? reviewT("editDetails") : reviewT("edit")} <Pencil data-icon="inline-end" />
                </Button>
              </div>
              <Table>
                <TableBody>
                  {isLoading && <SurveyAssignTeamRowsSkeleton />}
                  {!isLoading && visibleUsers.map((user) => (
                    <TableRow key={user.assignmentId} className="h-12 hover:bg-transparent">
                      <TableCell className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="lg">
                            <AvatarFallback className={`font-semibold text-card ${getAvatarFallbackColor(user)}`}>
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-col">
                            <span className="text-sm font-semibold">{getUserName(user)}</span>
                            <span className="truncate text-sm text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-1/2 px-5 py-3 text-muted-foreground">
                        {assignTeamT(`roles.${roleLabelKeys[user.role]}`)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && !visibleUsers.length && (
                    <TableRow>
                      <TableCell className="px-5 py-6 text-start text-muted-foreground" colSpan={2}>
                        {reviewT("assignTeam.noTeamMembersSelected")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <SurveyAssignTeamPagination
              page={page}
              perPage={perPage}
              totalPages={totalPages}
              totalCount={usersPagination?.total ?? 0}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
            />
          </>
        ) : (
          <div className="rounded-md bg-muted/50 p-3">{assignTeamT("publicDescription")}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default SurveyAssignTeamCard;
