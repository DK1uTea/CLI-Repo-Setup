import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/shared/components/ui/table";

const REVIEW_EVENT_INFO_ROW_COUNT = 4;

const ReviewEventInfoTableSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableBody>
          {Array.from({ length: REVIEW_EVENT_INFO_ROW_COUNT }).map((_, index) => (
            <TableRow key={index} className="h-12 hover:bg-transparent">
              <TableCell className="w-50 border-r px-5 py-3">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="px-5 py-3">
                <Skeleton className="h-4 w-full max-w-80" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReviewEventInfoTableSkeleton;
