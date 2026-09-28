"use client";

import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";

import { Pagination } from "@/shared/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type Props = {
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const limitOptions = ["10", "20", "50", "100"];

const EventAddressPagination = ({ totalPages, currentPage }: Props) => {
  const t = useTranslations("events.address");
  const [limit, setLimit] = useQueryState("limit", parseAsString.withDefault("10"));
  const [, setPage] = useQueryState("page", parseAsString.withDefault("1"));

  const currentLimit = limitOptions.includes(limit) ? Number(limit) : 10;

  const handleLimitChange = (value: string) => {
    setLimit(value);
    setPage("1");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-center">
      <Select value={String(currentLimit)} onValueChange={handleLimitChange}>
        <SelectTrigger className="w-full bg-card sm:w-fit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {limitOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option} {t("perPage")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(pageNumber) => setPage(String(pageNumber))}
          className="mx-0 w-full justify-center sm:w-auto sm:justify-end"
        />
      )}
    </div>
  );
};

export default EventAddressPagination;
