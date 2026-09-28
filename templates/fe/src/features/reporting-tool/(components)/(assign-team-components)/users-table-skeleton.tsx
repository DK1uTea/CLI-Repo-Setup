import { Skeleton } from "@/shared/components/ui/skeleton";
import { TableCell, TableRow } from "@/shared/components/ui/table";

const UsersTableSkeleton = () => {
  return Array.from({ length: 3 }).map((_, index) => (
    <TableRow key={index} className="h-14">
      <TableCell className="px-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </TableCell>
      <TableCell className="px-5">
        <Skeleton className="h-8 w-36" />
      </TableCell>
      <TableCell className="px-5">
        <div className="flex justify-end">
          <Skeleton className="size-8" />
        </div>
      </TableCell>
    </TableRow>
  ));
};

export default UsersTableSkeleton;
