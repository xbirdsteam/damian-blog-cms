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
import { Card } from "@/components/ui/card";
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
}

export function PostCard({ post }: PostCardProps) {
  const { deletePost, isDeleting } = usePosts();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      <Link href={`/cms/posts/${post.id}`}>
        <Card
          key={post.id}
          className="group overflow-hidden border cursor-pointer relative flex flex-col min-h-[400px]"
        >
          {/* Featured Image */}
          <div className="relative w-full aspect-video bg-muted border-b">
            {post.post_img ? (
              <LoadingImage
                src={post.post_img}
                alt={post.title}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                <Eye className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
            <Badge
              variant={post.status === "published" ? "default" : "secondary"}
              className="absolute top-4 right-4 capitalize"
            >
              {post.status}
            </Badge>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 flex-1 flex flex-col">
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-xl line-clamp-2 leading-tight">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {post.short_description}
              </p>
            </div>

            {/* Meta Information */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {post.posts_categories && post.posts_categories.length > 0 && (
                <div className="flex items-start gap-2 pb-12">
                  <Tag className="h-4 w-4 flex-shrink-0 mt-1" />
                  <div className="flex flex-wrap gap-1">
                    {post.posts_categories.map((pc) => (
                      <Badge
                        key={pc.categories.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {pc.categories.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delete Button */}
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
