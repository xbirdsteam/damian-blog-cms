"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PostDetailFooter from "./post-detail-footer";
import PostContentRender from "./post-content-render";
import { postService } from "@/services/post-service";
import { Skeleton } from "@/components/ui/skeleton";

function PostDetailSkeleton() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" /> {/* Title */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" /> {/* Date */}
          <Skeleton className="h-4 w-32" /> {/* Categories */}
        </div>
      </div>

      {/* Featured Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Content Blocks */}
      <div className="space-y-6">
        {/* Paragraph blocks */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        
        {/* Image block */}
        <Skeleton className="aspect-video w-full" />
        
        {/* More paragraphs */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Footer */}
      <div className="border-t pt-6 mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16" /> {/* Tags label */}
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-20" /> /* Tags */
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" /> {/* Prev button */}
            <Skeleton className="h-10 w-32" /> {/* Next button */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailContent() {
  const { slug } = useParams();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => postService.getPostBySlug(slug as string),
    enabled: !!slug,
  });

  if (isLoading) return <PostDetailSkeleton />;
  if (!post) return null;

  return (
    <>
      <article className="container mx-auto py-10">
        <PostContentRender
          content={JSON.parse(post.content)}
          created_at={post.created_at}
          post_img={post.post_img}
          categories={post.posts_categories?.map((category) => category.categories.name) || []}
        />
      </article>
      <PostDetailFooter
        tags={post.tags || []}
        prevPost={post.prev_post || undefined}
        nextPost={post.next_post || undefined}
      />
    </>
  );
}
