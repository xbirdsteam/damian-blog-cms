'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useComments } from "@/hooks/use-comments";
import { useDebounce } from "@/hooks/use-debounce";
import { CommentStatus, Comment as CommentType } from "@/services/comment-service";
import { format } from "date-fns";
import { Check, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CommentsTableSkeleton } from "./comments-skeleton";

const getCommentSource = (comment: CommentType) => {
  return comment.author_email ? "Email" : "Instagram";
};

export function CommentsTable() {
  const { data, isLoading, approveComment, rejectComment } = useComments();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CommentStatus | "all">("all");
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filterComments = () => {
    if (!data) return [];
    let filtered = data.comments;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Filter by search query
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(c => 
        c.content.toLowerCase().includes(searchLower) ||
        c.author_name.toLowerCase().includes(searchLower) ||
        c.author_email.toLowerCase().includes(searchLower) ||
        c.post?.title.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const filteredComments = filterComments();
  const unapprovedCount = data?.comments.filter(c => c.status === "unapproved").length || 0;

  const handleStatusChange = async (id: string, status: CommentStatus) => {
    try {
      if (status === "approved") {
        await approveComment(id);
      } else if (status === "trash") {
        await rejectComment(id);
      }
    } catch (error) {
      console.error(`Failed to update comment status:`, error);
    }
  };

  if (isLoading) {
    return <CommentsTableSkeleton />;
  }

  return (
    <div className="p-8">
      <div className="rounded-lg bg-card">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px]"
              />
              <Select value={statusFilter} onValueChange={(value: CommentStatus | "all") => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Comments</SelectItem>
                  <SelectItem value="unapproved">
                    Unapproved {unapprovedCount > 0 && `(${unapprovedCount})`}
                  </SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="trash">Trash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px] py-5 pl-6">Author</TableHead>
                  <TableHead className="w-[300px]">Comment</TableHead>
                  <TableHead className="w-[200px]">Post</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Source</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px] text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col">
                        <span className="font-medium">{comment.author_name}</span>
                        <span className="text-sm text-muted-foreground">{comment.author_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-2">{comment.content}</p>
                    </TableCell>
                    <TableCell>
                      {comment.post && (
                        <Link
                          href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/${comment.post.slug}`}
                          className="line-clamp-1 text-blue-600 hover:text-blue-800 hover:underline"
                          target="_blank"
                        >
                          {comment.post.title}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(comment.created_at), "MMM d, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          getCommentSource(comment as CommentType) === "Email" 
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }
                      >
                        {getCommentSource(comment as CommentType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          comment.status === "approved" ? "success" : 
                          comment.status === "unapproved" ? "secondary" : "destructive"
                        }
                        className="capitalize"
                      >
                        {comment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {comment.status === "unapproved" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(comment.id, "approved")}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(comment.id, "trash")}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Move to Trash
                              </DropdownMenuItem>
                            </>
                          )}
                          {comment.status === "approved" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(comment.id, "trash")}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Move to Trash
                            </DropdownMenuItem>
                          )}
                          {comment.status === "trash" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(comment.id, "unapproved")}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Restore
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredComments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No comments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
} 