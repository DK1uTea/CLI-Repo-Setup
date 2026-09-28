'use client';

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
  limit: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: string) => void;
};

const AnswersPagination = ({
  page,
  limit,
  totalCount,
  onPageChange,
  onLimitChange,
}: Props) => {
  const t = useTranslations("reportingTool.answersOverview.pagination");

  const totalPages = Math.ceil(totalCount / limit);
  if (totalCount < 5) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end py-2">
      <Select value={String(limit)} onValueChange={onLimitChange}>
        <SelectTrigger className="w-full bg-card sm:w-fit h-8 text-sm">
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
          className="mx-0 w-full justify-center sm:w-auto sm:justify-end"
        />
      )}
    </div>
  );
};

export default AnswersPagination;
