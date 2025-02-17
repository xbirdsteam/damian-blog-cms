"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { usePosts } from "@/hooks/use-posts";
import { useCategories } from "@/hooks/use-categories";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { PostCard } from "@/components/posts/post-card";
import { PostSkeleton } from "@/components/posts/post-skeleton";

export function PostsList({ onSelectPost }: { onSelectPost: (postId: string) => void }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const perPage = 12;

  const debouncedSearch = useDebounce(searchInput, 300);
  const { categories } = useCategories();

  const { posts, pagination, isLoading } = usePosts({
    page: currentPage,
    perPage,
    categories: selectedCategories,
    search: debouncedSearch || undefined,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategories]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Posts Comments</CardTitle>
          <CardDescription>
            Select a post to manage its comments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  className="pl-8"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full sm:w-2/3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategories.length === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                  className="rounded-full"
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategories.includes(category.id)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleCategoryChange(category.id)}
                    className="rounded-full"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                {Array.from({ length: perPage }).map((_, index) => (
                  <PostSkeleton key={index} />
                ))}
              </>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id}>
                  <PostCard 
                    post={post}
                    href="#"
                    onClickPost={onSelectPost}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No posts found
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && posts.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => 
                    setCurrentPage((prev) => 
                      Math.min(prev + 1, pagination.totalPages)
                    )
                  }
                  disabled={currentPage >= pagination.totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 