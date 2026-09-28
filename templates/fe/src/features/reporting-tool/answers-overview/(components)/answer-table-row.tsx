import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";

import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/date-utils";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { useDateFormat } from "@/shared/stores/use-user-store";
import type { Answer } from "../../(helpers)/trade-fair-answer-type";
import { AnswerStatusBadge } from "../../(components)/answer-status-badge";
import DeleteAnswerAlertDialog from "./delete-answer-alert-dialog";

type Props = {
  answer: Answer;
};

const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName?.[0] || "";
  const l = lastName?.[0] || "";
  return `${f}${l}`.toUpperCase() || "??";
};

const AnswerTableRow = ({ answer }: Props) => {
  const t = useTranslations("reportingTool.answersOverview");
  const dateFormat = useDateFormat();
  const [eventId] = useQueryState("eventId", parseAsString);
  const leadName = answer.lead?.fullName || `${answer.lead?.firstName ?? ""} ${answer.lead?.lastName ?? ""}`.trim() || "—";
  const userName = `${answer.user?.firstName ?? ""} ${answer.user?.lastName ?? ""}`.trim()
    || answer.user?.email
    || t("anonymous");
  const reportHref = `/reporting-tool/report?id=${answer.id}${eventId ? `&eventId=${eventId}` : ""}`;

  return (
    <TableRow className="h-14">
      <TableCell className="p-0">
        <Link className="flex h-14 items-center px-5" href={reportHref}>
          {leadName}
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <Link className="flex h-14 items-center px-5" href={reportHref}>
          {answer.survey.name}
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <Link className="flex h-14 items-center px-5" href={reportHref}>
          <AnswerStatusBadge status={answer.status}>
            {t(`status.${answer.status}`)}
          </AnswerStatusBadge>
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <Link className="flex h-14 items-center px-5" href={reportHref}>
          {formatDate(answer.createdAt, dateFormat, true)}
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <Link className="flex h-14 items-center px-5 gap-3" href={reportHref}>
          <Avatar>
            <AvatarFallback className="text-primary bg-primary/10">
              {answer.user
                ? getInitials(answer.user.firstName, answer.user.lastName)
                : t("anonymous").charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span>{userName}</span>
        </Link>
      </TableCell>
      <TableCell className="w-0 whitespace-nowrap px-5">
        <div className="flex justify-end gap-2 text-muted-foreground">
          <Button aria-label={t("editAnswer")} href={reportHref} size="icon" variant="ghost">
            <Pencil className="size-5" />
          </Button>
          <DeleteAnswerAlertDialog answerId={answer.id}>
            <Button aria-label={t("deleteAnswer")} size="icon" variant="ghost">
              <Trash2 className="size-5" />
            </Button>
          </DeleteAnswerAlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AnswerTableRow;
