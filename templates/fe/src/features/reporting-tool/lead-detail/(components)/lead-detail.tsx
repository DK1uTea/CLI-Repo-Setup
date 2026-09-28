import { Card, CardContent } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/shared/components/ui/table";
import { useTranslations } from "next-intl";
import { Lead } from "../../(helpers)/trade-fair-lead-type";

type Props = {
  lead: Lead;
};

const LeadDetail = ({ lead }: Props) => {
  const t = useTranslations("reportingTool.answerDetail");
  const addressLine = [lead.address, lead.zipCode, lead.city].filter(Boolean).join(", ");
  const salutation = lead.salutation ? t(`salutations.${lead.salutation}` as any) : "";
  const nameDisplay = salutation ? `${salutation} ${lead.fullName}` : lead.fullName;

  const rows = [
    { label: t("name"), value: nameDisplay },
    { label: t("company"), value: lead.company },
    { label: t("position"), value: lead.function },
    { label: t("address"), value: addressLine },
    { label: t("phoneNumber"), value: lead.phone },
    { label: t("email"), value: lead.email },
  ];

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <p className="text-base">{t("contactDetails")}</p>

        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label} className="h-12 hover:bg-transparent">
                  <TableCell className="w-65 min-w-65 max-w-65 border-r px-5 py-3 font-medium whitespace-normal">
                    {row.label}
                  </TableCell>
                  <TableCell className="px-5 py-3 whitespace-normal font-light">
                    {row.value || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default LeadDetail;
