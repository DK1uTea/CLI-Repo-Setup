'use client';

import { Pagination } from '@/shared/components/ui/pagination';

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function ProductListPagination({ page, totalPages, onPageChange }: Props) {
  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      className="justify-center md:justify-end"
    />
  );
}
