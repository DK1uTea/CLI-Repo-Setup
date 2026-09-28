import { useTranslations } from "next-intl";

import { TableCell, TableRow } from "@/shared/components/ui/table";

const LeadsTableEmpty = () => {
  const t = useTranslations("reportingTool.leadsOverview");

  return (
    <TableRow>
      <TableCell className="px-5 py-6 text-center text-muted-foreground" colSpan={6}>
        {t("noLeads")}
      </TableCell>
    </TableRow>
  );
};

export default LeadsTableEmpty;
