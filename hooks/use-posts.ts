'use client'
import { CreatePostOptions, PaginatedPosts, Post, postService, PostStats } from "@/services/post-service";
import { useQuery, useQueryClient, useMutation, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";

// Separate hook for stats to avoid duplicate queries
export function usePostStats() {
    return useQuery<PostStats>({
        queryKey: ["posts-stats"],
        queryFn: () => postService.getPostStats(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15,   // 15 minutes
    });
}

interface UsePostsOptions {
    page?: number;
    perPage?: number;
    categories?: string[];
    search?: string;
    status?: string;
}

export function usePosts({
    page = 1,
    perPage = 10,
    categories,
    search,
    status,
}: UsePostsOptions = {}) {
    const queryKey = ['posts', page, perPage, categories, search, status];
    const queryClient = useQueryClient();
    
    const { data, isLoading } = useQuery({
        queryKey,
        queryFn: () => postService.getPosts({ page, perPage, categories, search, status }),
        placeholderData: keepPreviousData,
    });

    const { mutateAsync: createPost, isPending: isCreating } = useMutation({
        mutationFn: (newPost: CreatePostOptions) => postService.createPost(newPost),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["posts"]
            });
            queryClient.invalidateQueries({
                queryKey: ["posts-stats"]
            });
        },
        onError: (error) => {
            console.error("Error creating post:", error);
            toast.error("Failed to create post");
        },
    });

    const { mutateAsync: updatePost, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, ...updates }: Partial<CreatePostOptions> & { id: string }) =>
            postService.updatePost(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["posts"]
            });
            queryClient.invalidateQueries({
                queryKey: ["posts-stats"]
            });
        },
        onError: (error) => {
            console.error("Error updating post:", error);
            toast.error("Failed to update post");
        },
    });

    const { mutateAsync: deletePost, isPending: isDeleting } = useMutation({
        mutationFn: (postId: string) => postService.deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["posts"]
            });
            queryClient.invalidateQueries({
                queryKey: ["posts-stats"]
            });
        },
    });

    return {
        posts: data?.posts ?? [],
        pagination: data?.pagination ?? { currentPage: 1, totalPages: 1 },
        isLoading,
        createPost,
        updatePost,
        deletePost,
        isCreating,
        isUpdating,
        isDeleting
    };
}

// Optional: Add a hook for single post
export function usePost(postId: string) {
    const queryClient = useQueryClient();

    return useQuery<Post>({
        queryKey: ["post", postId],
        queryFn: () => postService.getPost(postId),
        initialData: () => {
            // Use posts list as initial data source if available
            const posts = queryClient.getQueryData<PaginatedPosts>(["posts"])?.posts;
            return posts?.find(post => post.id === postId);
        },
    });
}