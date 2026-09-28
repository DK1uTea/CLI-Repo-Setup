import { Pagination } from '@/shared/components/ui/pagination';
import type { PaginationType } from '@/shared/types/pagination-type';

type Props = {
  pagination: PaginationType;
  page: number;
  onPageChange: (page: number) => void;
};

export function HelpingHandsPagination({ pagination, page, onPageChange }: Props) {
  const { totalPages } = pagination;

  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      className="mt-6 justify-center sm:justify-end"
    />
  );
}
