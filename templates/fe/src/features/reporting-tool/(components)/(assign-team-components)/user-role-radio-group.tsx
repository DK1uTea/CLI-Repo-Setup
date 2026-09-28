import { useTranslations } from "next-intl";

import type { AssignTeamUserRole } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";

const roleOptions = [
  {
    value: "PROMOTER",
    labelKey: "promoter",
    descriptionKey: "promoterDescription",
  },
  {
    value: "SALES_REP",
    labelKey: "salesRep",
    descriptionKey: "salesRepDescription",
  },
  {
    value: "ADMIN",
    labelKey: "admin",
    descriptionKey: "adminDescription",
  },
] as const;

type UserRoleRadioGroupProps = {
  value: AssignTeamUserRole;
  onValueChange: (value: AssignTeamUserRole) => void;
  idPrefix: string;
};

const UserRoleRadioGroup = ({
  value,
  onValueChange,
  idPrefix,
}: UserRoleRadioGroupProps) => {
  const t = useTranslations("reportingTool.tradeFairEventForm.assignTeam.roles");
  const descriptionT = useTranslations("reportingTool.tradeFairEventForm.assignTeam.roleDescriptions");

  return (
    <RadioGroup
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as AssignTeamUserRole)}
      className="gap-5"
    >
      {roleOptions.map((option) => {
        const id = `${idPrefix}-${option.value.toLowerCase().replace("_", "-")}`;

        return (
          <div key={option.value} className="flex items-start gap-3">
            <RadioGroupItem id={id} value={option.value} className="mt-0.5" />
            <div className="flex flex-col gap-1">
              <Label htmlFor={id} className="font-semibold">
                {t(option.labelKey)}
              </Label>
              <p className="text-xs font-medium text-muted-foreground">
                {descriptionT(option.descriptionKey)}
              </p>
            </div>
          </div>
        );
      })}
    </RadioGroup>
  );
};

export default UserRoleRadioGroup;
