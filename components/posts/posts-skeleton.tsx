import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PostsTableSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>

      {/* Action Button Skeleton */}
      <div className="flex items-center justify-end">
        <Skeleton className="h-10 w-[120px]" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-[200px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[400px] py-5 pl-6">Title</TableHead>
              <TableHead className="w-[120px] hidden md:table-cell">Image</TableHead>
              <TableHead className="w-[200px] hidden lg:table-cell">Categories</TableHead>
              <TableHead className="w-[200px] hidden lg:table-cell">Tags</TableHead>
              <TableHead className="w-[180px] pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="py-4 pl-6">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-[300px]" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-[80px]" />
                      <Skeleton className="h-8 w-[80px]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell py-4">
                  <Skeleton className="h-20 w-20 rounded-md" />
                </TableCell>
                <TableCell className="hidden lg:table-cell py-4">
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell py-4">
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </TableCell>
                <TableCell className="py-4 pr-6">
                  <div className="flex flex-col items-end gap-1.5">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 