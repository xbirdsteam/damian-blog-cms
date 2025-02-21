import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CommentsTableSkeleton() {
  return (
    <div className="p-8">
      <div className="rounded-lg bg-card">
        <div className="p-6 space-y-6">
          {/* Search and Filter Skeletons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-[300px]" />
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px] py-5 pl-6">Author</TableHead>
                  <TableHead className="w-[300px]">Comment</TableHead>
                  <TableHead className="w-[200px]">Post</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Source</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px] text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-[140px]" />
                        <Skeleton className="h-3 w-[160px]" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[180px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[80px]" />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
} 