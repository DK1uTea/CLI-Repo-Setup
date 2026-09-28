import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import UsersTableSkeleton from "./users-table-skeleton";

const AssignTeamCardSkeleton = () => {
  const t = useTranslations("reportingTool.tradeFairEventForm.assignTeam.table");

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10.5 w-32 rounded-button" />
          <Skeleton className="h-10.5 w-34 rounded-button" />
          <Skeleton className="h-10.5 w-28 rounded-button" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="h-12">
                  <TableHead className="px-5">
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                  <TableHead className="px-5">
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                  <TableHead className="px-5">
                    <span className="sr-only">{t("actions")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <UsersTableSkeleton />
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-9 w-32 rounded-button" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-button" />
              <Skeleton className="size-9 rounded-button" />
              <Skeleton className="size-9 rounded-button" />
              <Skeleton className="h-9 w-20 rounded-button" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignTeamCardSkeleton;
