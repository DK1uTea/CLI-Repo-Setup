import { Skeleton } from "@/shared/components/ui/skeleton";
import { TableCell, TableRow } from "@/shared/components/ui/table";

const LeadsTableSkeleton = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index} className="h-14">
      <TableCell className="px-5">
        <Skeleton className="h-5 w-36" />
      </TableCell>
      <TableCell className="px-5">
        <Skeleton className="h-5 w-40" />
      </TableCell>
      <TableCell className="px-5">
        <Skeleton className="h-5 w-64" />
      </TableCell>
      <TableCell className="px-5">
        <Skeleton className="h-5 w-32" />
      </TableCell>
      <TableCell className="px-5">
        <Skeleton className="h-5 w-48" />
      </TableCell>
      <TableCell className="w-0 whitespace-nowrap px-5">
        <Skeleton className="h-6 w-20 rounded-[8px]" />
      </TableCell>
    </TableRow>
  ));
};

export default LeadsTableSkeleton;
