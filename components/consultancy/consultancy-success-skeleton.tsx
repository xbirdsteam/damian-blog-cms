import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ConsultancySuccessSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Steps Skeleton */}
      {[1, 2, 3].map((index) => (
        <Card key={index} className="relative border-dashed">
          {/* Step Number Badge Skeleton */}
          <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-muted" />

          <CardHeader className="flex flex-row items-start justify-between pt-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-9 w-9" />
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          </CardHeader>
        </Card>
      ))}

      {/* Save Button Skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}
