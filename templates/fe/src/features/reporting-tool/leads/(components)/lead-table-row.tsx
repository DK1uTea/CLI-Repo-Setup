import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { LeadStatusBadge } from "../../(components)/lead-status-badge";
import type { Lead } from "../../(helpers)/trade-fair-lead-type";

type Props = {
  lead: Lead;
  eventId: string;
};

const LeadTableRow = ({ lead, eventId }: Props) => {
  const t = useTranslations("reportingTool.leadsOverview");
  const leadName = lead.fullName || `${lead.firstName || ""} ${lead.lastName || ""}`.trim();
  const address = [lead.address, lead.zipCode, lead.city].filter(Boolean).join(", ");
  const leadHref = `/reporting-tool/lead?id=${encodeURIComponent(lead.id)}&eventId=${encodeURIComponent(eventId)}`;

  return (
    <TableRow className="h-14">
      <TableCell className="p-0">
        <Link className="flex h-14 items-center px-5" href={leadHref}>
          {leadName}
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <Link className="flex h-14 items-center px-5" href={leadHref}>
          {lead.company}
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <Link className="flex h-14 items-center px-5" href={leadHref}>
          {address}
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <Link className="flex h-14 items-center px-5" href={leadHref}>
          {lead.phone}
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <Link className="flex h-14 items-center px-5" href={leadHref}>
          {lead.email}
        </Link>
      </TableCell>
      <TableCell className="w-0 whitespace-nowrap p-0">
        <Link className="flex h-14 items-center px-5" href={leadHref}>
          <LeadStatusBadge status={lead.status}>
            {t(`status.${lead.status}`)}
          </LeadStatusBadge>
        </Link>
      </TableCell>
    </TableRow>
  );
};

export default LeadTableRow;
