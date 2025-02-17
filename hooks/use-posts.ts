'use client'
import { CreatePostOptions, PaginatedPosts, Post, postService, PostStats } from "@/services/post-service";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
    categories?: string[];
    enabled?: boolean;
    page?: number;
    perPage?: number;
    search?: string;
}

export function usePosts(options: UsePostsOptions = {}) {
    const queryClient = useQueryClient();
    const queryKey = ["posts", {
        categories: options.categories,
        page: options.page || 1,
        search: options.search
    }];

    const {
        data: paginatedPosts,
        isLoading,
        refetch,
    } = useQuery<PaginatedPosts>({
        queryKey,
        queryFn: async () => {
            const result = await postService.getPosts(options);
            // Transform the result to match PaginatedPosts interface
            return {
                posts: result.posts,
                page: result.currentPage,
                perPage: result.perPage,
                total: result.total,
                totalPages: result.totalPages,
            };
        },
        enabled: options.enabled !== false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 15,
    });

    // Mutations
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
        posts: paginatedPosts?.posts || [],
        pagination: {
            currentPage: paginatedPosts?.page || 1,
            totalPages: paginatedPosts?.totalPages || 0,
            total: paginatedPosts?.total || 0,
            perPage: paginatedPosts?.perPage || 12,
        },
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
        refetch,
        createPost,
        updatePost,
        deletePost,
    };
}

// Optional: Add a hook for single post
export function usePost(postId: string) {
    const queryClient = useQueryClient();

    return useQuery<Post>({
        queryKey: ["post", postId],
        queryFn: () => postService.getPost(postId),
        staleTime: 1000 * 60 * 5,
        initialData: () => {
            // Use posts list as initial data source if available
            const posts = queryClient.getQueryData<PaginatedPosts>(["posts"])?.posts;
            return posts?.find(post => post.id === postId);
        },
    });
}