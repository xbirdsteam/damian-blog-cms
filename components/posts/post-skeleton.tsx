import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function PostSkeleton() {
  return (
    <Card className="overflow-hidden border">
      {/* Featured Image Skeleton */}
      <Skeleton className="w-full aspect-video border-b" />

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-[80%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[60%]" />
        </div>

        {/* Meta Information */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[100px]" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
