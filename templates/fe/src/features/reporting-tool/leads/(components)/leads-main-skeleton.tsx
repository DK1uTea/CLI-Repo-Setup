import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import LeadsTableSkeleton from "./leads-table-skeleton";

const LeadsMainSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <Card>
        <CardContent className="gap-0">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Skeleton className="h-60 w-full rounded-2xl sm:h-40 sm:w-56 sm:shrink-0 lg:w-64" />
            <div className="flex flex-col gap-4 sm:grow lg:flex-row lg:items-end">
              <div className="flex flex-col gap-3 sm:grow">
                <Skeleton className="h-7 w-3/4 max-w-96" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-44" />
                </div>
                <div className="flex min-h-10 flex-col gap-2">
                  <Skeleton className="h-4 w-full max-w-125" />
                  <Skeleton className="h-4 w-4/5 max-w-lg" />
                </div>
              </div>
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex w-full flex-col items-stretch gap-2.5 lg:flex-row lg:items-center">
        <Skeleton className="h-8 min-w-72 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-full rounded-button lg:w-24" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="h-12">
              {Array.from({ length: 6 }).map((_, index) => (
                <TableHead key={index} className="px-5">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <LeadsTableSkeleton />
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadsMainSkeleton;
