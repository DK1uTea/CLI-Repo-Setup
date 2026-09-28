import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/shared/components/ui/table";

const AnswerDetailSkeleton = () => {
  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* UserCreateInfo Skeleton */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

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

      {/* Steps Skeleton */}
      {[...Array(2)].map((_, stepIdx) => (
        <Card key={stepIdx}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {[...Array(1)].map((_, groupIdx) => (
              <div key={groupIdx} className="flex flex-col gap-3">
                <Skeleton className="h-5 w-32" />
                <div className="border rounded-2xl overflow-hidden bg-card">
                  <Table>
                    <TableBody>
                      {[...Array(3)].map((_, rowIdx) => (
                        <TableRow key={rowIdx} className="h-12 hover:bg-transparent">
                          <TableCell className="w-65 min-w-65 max-w-65 border-r px-5 py-3">
                            <Skeleton className="h-4 w-36" />
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnswerDetailSkeleton;
