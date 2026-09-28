import { Skeleton } from "@/shared/components/ui/skeleton";
import { TableCell, TableRow } from "@/shared/components/ui/table";

const SurveyAssignTeamRowsSkeleton = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index} className="h-19">
      <TableCell className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4">
        <Skeleton className="h-4 w-24" />
      </TableCell>
    </TableRow>
  ));
};

export default SurveyAssignTeamRowsSkeleton;
