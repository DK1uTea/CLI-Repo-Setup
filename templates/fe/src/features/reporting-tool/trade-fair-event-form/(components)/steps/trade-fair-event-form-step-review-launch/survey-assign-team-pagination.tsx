"use client";

import { useTranslations } from "next-intl";

import { Pagination } from "@/shared/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const perPageOptions = ["5", "10", "20", "30"];

type Props = {
  page: number;
  perPage: string;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: string) => void;
};

const SurveyAssignTeamPagination = ({
  page,
  perPage,
  totalPages,
  totalCount,
  onPageChange,
  onPerPageChange,
}: Props) => {
  const t = useTranslations("reportingTool.tradeFairEventForm.assignTeam.pagination");

  if (totalCount < 5) return null;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
      <Select value={perPage} onValueChange={onPerPageChange}>
        <SelectTrigger className="w-full bg-card lg:w-fit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            {perPageOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {t("perPage", { value: option })}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="mx-0 w-full justify-center lg:w-auto lg:justify-end"
        />
      )}
    </div>
  );
};

export default SurveyAssignTeamPagination;
