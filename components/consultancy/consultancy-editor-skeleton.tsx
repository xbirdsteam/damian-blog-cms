import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ConsultancyEditorSkeleton() {
  return (
    <div className="space-y-6">
      {/* Featured Image Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="aspect-video relative rounded-lg border-2 border-dashed flex items-center justify-center">
            <Skeleton className="h-8 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Content Blocks Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
          <Skeleton className="h-9 w-28" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Multiple block skeletons */}
          {[1, 2, 3].map((index) => (
            <Card key={index} className="relative border-dashed">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
                <Skeleton className="h-24 w-full" />
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-9 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-9 w-28" />
                  </div>
                  <div className="space-y-3 pl-4">
                    {[1, 2].map((itemIndex) => (
                      <div
                        key={itemIndex}
                        className="rounded-lg border bg-card p-4 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-10 flex-1" />
                          <Skeleton className="h-9 w-9" />
                        </div>
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Save Button Skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}
