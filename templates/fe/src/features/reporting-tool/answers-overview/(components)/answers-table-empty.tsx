import { useTranslations } from "next-intl";

import { TableCell, TableRow } from "@/shared/components/ui/table";

const AnswersTableEmpty = () => {
  const t = useTranslations("reportingTool.answersOverview");

  return (
    <TableRow>
      <TableCell className="px-5 py-6 text-center text-muted-foreground" colSpan={6}>
        {t("noAnswers")}
      </TableCell>
    </TableRow>
  );
};

export default AnswersTableEmpty;
