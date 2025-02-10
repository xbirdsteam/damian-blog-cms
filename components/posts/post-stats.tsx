"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePostStats } from "@/hooks/use-posts";
import { FileText, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function PostStats() {
  const { data: stats, isLoading: isLoadingStats } = usePostStats();
  if (isLoadingStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Posts Card Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-24" />
            </CardTitle>
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Categories Card Skeleton */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-32" />
            </CardTitle>
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-24" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Posts Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPosts}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">
              Published: {stats.byStatus.published}
            </Badge>
            <Badge variant="outline">Draft: {stats.byStatus.draft}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Categories Card */}
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Posts by Category
          </CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.byCategory.map((category) => (
              <Badge
                key={category.categoryId}
                variant={category.count > 0 ? "outline" : "secondary"}
                className={`text-sm ${
                  category.count === 0 ? "opacity-60" : ""
                }`}
              >
                {category.categoryName} ({category.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
