import { useTranslations } from "next-intl";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import LeadTableRow from "./lead-table-row";
import LeadsTableEmpty from "./leads-table-empty";
import LeadsTableSkeleton from "./leads-table-skeleton";
import type { Lead } from "../../(helpers)/trade-fair-lead-type";

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  eventId: string;
}

const LeadsTable = ({ leads, isLoading, eventId }: LeadsTableProps) => {
  const t = useTranslations("reportingTool.leadsOverview.table");

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="h-12">
            <TableHead className="px-5 font-semibold">{t("lead")}</TableHead>
            <TableHead className="px-5 font-semibold">{t("company")}</TableHead>
            <TableHead className="px-5 font-semibold">{t("address")}</TableHead>
            <TableHead className="px-5 font-semibold">{t("phoneNumber")}</TableHead>
            <TableHead className="px-5 font-semibold">{t("email")}</TableHead>
            <TableHead className="px-5" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <LeadsTableSkeleton />}
          {!isLoading && leads.map((lead) => (
            <LeadTableRow key={lead.id} lead={lead} eventId={eventId} />
          ))}
          {!isLoading && !leads.length && <LeadsTableEmpty />}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsTable;
