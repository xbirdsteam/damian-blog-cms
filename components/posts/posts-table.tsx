/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Post } from "@/services/post-service";
import { Calendar, Eye, Pencil, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LoadingImage } from "@/components/ui/loading-image";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PostsTableProps {
  posts: Post[];
  isLoading?: boolean;
}

export function PostsTable({ posts, isLoading }: PostsTableProps) {
  return (
    <div className="relative rounded-md border bg-card">
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      <Table className={cn(isLoading && "opacity-50")}>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[400px] py-5 pl-6">Title</TableHead>
            <TableHead className="w-[120px] hidden md:table-cell">
              Image
            </TableHead>
            <TableHead className="w-[200px] hidden lg:table-cell">
              Categories
            </TableHead>
            <TableHead className="w-[200px] hidden lg:table-cell">
              Tags
            </TableHead>
            <TableHead className="w-[180px] pr-6 text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id} className="hover:bg-muted/50">
              <TableCell className="align-top py-4 pl-6">
                <div className="space-y-3">
                  <div className="font-medium">{post.title}</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 px-3 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Link
                        href={
                          post.status === "draft"
                            ? `/preview/${post.slug}`
                            : `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${post.slug}`
                        }
                        target="_blank"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 px-3 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                    >
                      <Link href={`/posts/${post.id}`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                  {/* Show categories on mobile */}
                  <div className="flex flex-wrap gap-2 lg:hidden">
                    {post.posts_categories?.map((pc) => (
                      <Badge
                        key={pc.categories.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {pc.categories.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell py-4">
                {post.post_img && (
                  <div className="relative w-20 h-20 rounded-md overflow-hidden">
                    <LoadingImage
                      src={post.post_img}
                      alt={post.title}
                      className="object-cover"
                      fill
                      sizes="80px"
                    />
                  </div>
                )}
              </TableCell>

              <TableCell className="hidden lg:table-cell py-4">
                <div className="flex flex-wrap gap-2">
                  {post.posts_categories?.map((pc) => (
                    <Badge key={pc.categories.id} variant="secondary">
                      {pc.categories.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>

              <TableCell className="hidden lg:table-cell py-4">
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {(!post.tags || post.tags.length === 0) && (
                    <span className="text-sm text-muted-foreground">
                      No tags
                    </span>
                  )}
                </div>
              </TableCell>

              <TableCell className="py-4 pr-6 text-right">
                <div className="flex flex-col items-end gap-1.5">
                  <Badge
                    variant={
                      post.status === "published" ? "success" : "secondary"
                    }
                    className={cn(
                      "capitalize",
                      post.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    )}
                  >
                    {post.status}
                  </Badge>
                  {post.status === "published" && post.publish_date && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(post.publish_date), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
