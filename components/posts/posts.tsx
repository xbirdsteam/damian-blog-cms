"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from "@/hooks/use-categories";
import { useDebounce } from "@/hooks/use-debounce";
import { usePosts } from "@/hooks/use-posts";
import { ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { CategoryList } from "./category-list";
import { PostStats } from "./post-stats";
import { PostsTable } from "./posts-table";
import { PostsFilter } from "./posts-filter";
import { PostsTableSkeleton } from "./posts-skeleton";

export default function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { categories } = useCategories();
  const { posts, pagination, isLoading } = usePosts({
    page: currentPage,
    perPage: 12,
    categories: selectedCategories,
    search: debouncedSearch,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const filteredPosts = useMemo(() => {
    if (statusFilter === "all") return posts;
    return posts.filter(post => post.status === statusFilter);
  }, [posts, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategories, statusFilter]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages));
  };

  if (isLoading) {
    return <PostsTableSkeleton />;
  }

  return (
    <Tabs defaultValue="posts" className="space-y-6">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="posts" className="space-y-6">
        <PostStats />

        <div className="flex items-center justify-end">
          <Button asChild>
            <Link href="/posts/create">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-between">
                  {selectedCategories.length > 0 
                    ? `${selectedCategories.length} categories`
                    : "Categories"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      setSelectedCategories((current) => {
                        if (checked) {
                          return [...current, category.id];
                        }
                        return current.filter((id) => id !== category.id);
                      });
                    }}
                  >
                    {category.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <PostsFilter 
              status={statusFilter} 
              onStatusChange={setStatusFilter} 
            />
          </div>
        </div>

        <div className="space-y-4">
          <PostsTable posts={filteredPosts} />
          {pagination.totalPages > 1 && (
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
        </div>
      </TabsContent>

      <TabsContent value="categories">
        <CategoryList />
      </TabsContent>
    </Tabs>
  );
}
