import { Pagination } from "@/shared/components/ui/pagination";

type RentalOrdersTablePaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const RentalOrdersTablePagination = ({ page, totalPages, onPageChange }: RentalOrdersTablePaginationProps) => {
  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      className="justify-center md:justify-end"
    />
  );
};

export default RentalOrdersTablePagination;
