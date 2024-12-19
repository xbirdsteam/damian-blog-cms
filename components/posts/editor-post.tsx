"use client";

import { usePost } from "@/hooks/use-posts";
import { notFound, useParams } from "next/navigation";
import { PostEditor } from "./post-editor";

export default function EditPost() {
  const { id } = useParams();
  const { data: post, isLoading } = usePost(id as string);

  if (isLoading) {
    return <PostSkeleton />;
  }

  if (!post) {
    return notFound();
  }

  return (
    <div className="p-6">
      <div className="mx-auto">
        <PostEditor mode="edit" initialData={post} />
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="p-6">
      <div className="mx-auto space-y-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-[400px] bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
