"use client";

import { Pagination } from "@/shared/components/ui/pagination";

type Props = {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

const SurveyLibraryPagination = ({
  page,
  totalPages,
  totalCount,
  onPageChange,
}: Props) => {
  if (totalCount <= 10) return null;

  return (
    <div className="flex flex-row justify-center sm:justify-end mt-4">
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

export default SurveyLibraryPagination;
