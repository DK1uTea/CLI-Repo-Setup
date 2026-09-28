import { Skeleton } from "@/shared/components/ui/skeleton";
import { TableCell, TableRow } from "@/shared/components/ui/table";

const AnswersTableSkeleton = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index} className="h-14">
      <TableCell className="px-5">
        <Skeleton className="h-5 w-36" />
      </TableCell>
      <TableCell className="px-5">
        <Skeleton className="h-5 w-40" />
      </TableCell>
      <TableCell className="px-5">
        <Skeleton className="h-6 w-24 rounded-[8px]" />
      </TableCell>
      <TableCell className="px-5">
        <Skeleton className="h-5 w-32" />
      </TableCell>
      <TableCell className="px-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
      </TableCell>
      <TableCell className="w-0 whitespace-nowrap px-5">
        <div className="flex justify-end gap-2">
          <Skeleton className="size-8 rounded-button" />
          <Skeleton className="size-8 rounded-button" />
        </div>
      </TableCell>
    </TableRow>
  ));
};

export default AnswersTableSkeleton;
