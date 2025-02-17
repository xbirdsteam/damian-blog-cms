"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useComments } from "@/hooks/use-comments";
import { CommentStatus } from "@/services/comment-service";
import { Check, Loader2, MoreHorizontal, Search, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/use-debounce";
import { PostsList } from "./posts-list";
import { CommentReplies } from "./comment-replies";

export function CommentsManagement() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [status, setStatus] = useState<CommentStatus>("unapproved");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const debouncedSearch = useDebounce(searchInput, 500);

  const { 
    comments, 
    isLoading, 
    updateStatus, 
    isUpdating, 
    deleteComment, 
    isDeleting,
    total,
    totalPages,
  } = useComments({
    status,
    search: debouncedSearch || undefined,
    page,
    perPage,
    post_id: selectedPostId || undefined,
  });

  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch, selectedPostId]);

  // Get post title from the first comment
  const postTitle = comments[0]?.post?.title;

  if (!selectedPostId) {
    return <PostsList onSelectPost={setSelectedPostId} />;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>{postTitle}</CardTitle>
              <CardDescription className="flex flex-col gap-1">
                <span>
                  {total} {total === 1 ? "comment" : "comments"}
                </span>
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPostId(null)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search comments..."
                  className="pl-8"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as CommentStatus)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unapproved">Unapproved</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="trash">Trash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No comments found
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.avatar_url || ""} />
                    <AvatarFallback>
                      {comment.author_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{comment.author_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {comment.author_email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {status !== "approved" && (
                              <DropdownMenuItem
                                onClick={() => updateStatus({ id: comment.id, status: "approved" })}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {status !== "unapproved" && (
                              <DropdownMenuItem
                                onClick={() => updateStatus({ id: comment.id, status: "unapproved" })}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Unapprove
                              </DropdownMenuItem>
                            )}
                            {status !== "trash" && (
                              <DropdownMenuItem
                                onClick={() => updateStatus({ id: comment.id, status: "trash" })}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Move to Trash
                              </DropdownMenuItem>
                            )}
                            {status === "trash" && (
                              <DropdownMenuItem
                                onClick={() => deleteComment(comment.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Permanently
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    {comment.replies && comment.replies.length > 0 && (
                      <CommentReplies replies={comment.replies} />
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Improved Pagination UI */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, total)} of {total} results
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2 px-2">
                    <div className="text-sm font-medium">Page</div>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-8 flex items-center justify-center rounded-md border bg-background">
                        {page}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        of {totalPages}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Next page</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 