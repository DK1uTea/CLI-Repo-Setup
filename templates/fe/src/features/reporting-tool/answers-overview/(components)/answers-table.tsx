import { useTranslations } from "next-intl";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import AnswerTableRow from "./answer-table-row";
import AnswersTableEmpty from "./answers-table-empty";
import AnswersTableSkeleton from "./answers-table-skeleton";
import type { Answer } from "../../(helpers)/trade-fair-answer-type";

interface AnswersTableProps {
  answers: Answer[];
  isLoading: boolean;
}

export function AnswersTable({ answers, isLoading }: AnswersTableProps) {
  const t = useTranslations("reportingTool.answersOverview.table");

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="h-12">
            <TableHead className="px-5 font-semibold">{t("lead")}</TableHead>
            <TableHead className="px-5 font-semibold">{t("survey")}</TableHead>
            <TableHead className="px-5 font-semibold">{t("status")}</TableHead>
            <TableHead className="px-5 font-semibold">{t("date")}</TableHead>
            <TableHead className="px-5 font-semibold">{t("user")}</TableHead>
            <TableHead className="px-5" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <AnswersTableSkeleton />}
          {!isLoading && answers.map((answer) => (
            <AnswerTableRow
              key={answer.id}
              answer={answer}
            />
          ))}
          {!isLoading && !answers.length && <AnswersTableEmpty />}
        </TableBody>
      </Table>
    </div>
  );
}
