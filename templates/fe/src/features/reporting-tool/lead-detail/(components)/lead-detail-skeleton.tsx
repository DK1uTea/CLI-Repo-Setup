import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/shared/components/ui/table";

const LeadDetailSkeleton = () => {
  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* LeadInfo Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-5 w-36" />
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i} className="h-12 hover:bg-transparent">
                    <TableCell className="w-65 min-w-65 max-w-65 border-r px-5 py-3">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadDetailSkeleton;
