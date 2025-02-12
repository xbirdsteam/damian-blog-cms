"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from "@/hooks/use-categories";
import { useDebounce } from "@/hooks/use-debounce";
import { usePosts } from "@/hooks/use-posts";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CategoryList } from "./category-list";
import { PostCard } from "./post-card";
import { PostSkeleton } from "./post-skeleton";
import { PostStats } from "./post-stats";

export default function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { categories } = useCategories();
  const { posts, pagination, isLoading } = usePosts({
    page: currentPage,
    perPage: 12,
    categories: selectedCategories,
    search: debouncedSearch,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategories]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages));
  };

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
    <Tabs defaultValue="posts" className="space-y-6">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <Link href="/cms/posts/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <TabsContent value="posts" className="space-y-6">
        <PostStats />

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/3">
            <Input
              id="search"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-2/3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={
                  selectedCategories.length === 0 ? "default" : "outline"
                }
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            <>
              {Array.from({ length: 12 }).map((_, index) => (
                <PostSkeleton key={index} />
              ))}
            </>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
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
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage >= pagination.totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="categories">
        <CategoryList />
      </TabsContent>
    </Tabs>
  );
}
