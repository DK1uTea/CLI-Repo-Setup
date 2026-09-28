"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Pagination } from "@/shared/components/ui/pagination";

const PAGE_SIZE_OPTIONS = ["10", "20", "50"];

type Props = {
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: string) => void;
};

const RecentActivityPagination = ({
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: Props) => {
  const tPagination = useTranslations("reportingTool.tradeFairEventForm.assignTeam.pagination");

  if (total < 10) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Select value={String(pageSize)} onValueChange={onPageSizeChange}>
        <SelectTrigger className="w-full bg-card sm:w-fit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {tPagination("perPage", { value: option })}
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

export default RecentActivityPagination;
