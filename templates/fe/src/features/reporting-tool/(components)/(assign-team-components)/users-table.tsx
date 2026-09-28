"use client";

import { useTranslations } from "next-intl";

import { UserEventSurvey } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import UsersTableSkeleton from "./users-table-skeleton";
import UserTableRow from "./user-table-row";

type Props = {
  users: UserEventSurvey[];
  totalCount: number;
  isLoading: boolean;
  onDelete?: (assignmentId: string) => void;
  onRoleChange?: (assignmentId: string, newRole: UserEventSurvey["role"]) => void;
};

const UsersTable = ({ users, totalCount, isLoading, onDelete, onRoleChange }: Props) => {
  const t = useTranslations("reportingTool.tradeFairEventForm.assignTeam.table");

  if (!isLoading && !users.length) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16">
        <p className="text-sm italic text-muted-foreground">{t("noDataAvailable")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="h-12">
            <TableHead className="px-5 font-semibold">
              {t("user")} <span className="font-normal">({totalCount})</span>
            </TableHead>
            <TableHead className="px-5 font-semibold">{t("role")}</TableHead>
            <TableHead className="px-5">
              <span className="sr-only">{t("actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <UsersTableSkeleton />}
          {!isLoading && users.map((user) => (
            <UserTableRow
              key={`${user.assignmentId}-${user.role}`}
              user={user}
              onDelete={() => onDelete?.(user.assignmentId)}
              onRoleChange={(newRole) => onRoleChange?.(user.assignmentId, newRole)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default UsersTable;
