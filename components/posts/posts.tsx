"use client";

import { Button } from "@/components/ui/button";
import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "./post-card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PostSkeleton } from "./post-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryList } from "./category-list";
import { PostStats } from "./post-stats";

export default function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const { posts, pagination, isLoading } = usePosts({
    page: currentPage,
    perPage: 12,
  });

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages));
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
        {/* Posts Grid */}
        <PostStats />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            // Show 12 skeleton cards while loading
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
