/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingImage } from "@/components/ui/loading-image";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePosts } from "@/hooks/use-posts";
import { Post } from "@/services/post-service";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Eye, Tag, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
  href?: string;
  onClickPost?: (postId: string) => void;
}

export function PostCard({ post, href, onClickPost }: PostCardProps) {
  const { deletePost, isDeleting } = usePosts();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (onClickPost) {
      e.preventDefault();
      onClickPost(post.id!);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePost(post.id!);
      toast.success("Post deleted successfully");
    } catch (e) {
      toast.error("Failed to delete post");
    } finally {
      setShowDeleteDialog(false);
    }
  };
  return (
    <>
      <Link 
        href={href || `/posts/${post.id}`}
        onClick={handleClick}
      >
        <Card className="h-[400px] flex flex-col">
          <CardContent className="flex-1 flex flex-col p-6">
            <div className="relative aspect-[16/9] overflow-hidden rounded-md mb-4">
              <LoadingImage
                src={post.post_img || ""}
                alt={post.title}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <h3 className="font-semibold leading-none tracking-tight mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {post.short_description}
              </p>

              <div className="mt-auto">
                <div className="flex flex-wrap gap-2">
                  {post.posts_categories?.map((pc) => (
                    <Badge key={pc.categories.id} variant="secondary">
                      {pc.categories.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>

          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <LoadingSpinner />
            ) : (
              <Trash className="size-4 mr-2" />
            )}
            Delete
          </Button>
        </Card>
      </Link>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              post &quot;{post.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <LoadingSpinner />
              ) : (
                <Trash className="size-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
