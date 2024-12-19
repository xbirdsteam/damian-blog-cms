import { CreatePostOptions, Post, postService } from "@/services/post-service";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

interface UsePostsOptions {
    category?: string;
    enabled?: boolean;
}

export function usePosts(options: UsePostsOptions = {}) {
    const queryClient = useQueryClient();
    const queryKey = ["posts", { category: options.category }];

    const {
        data: posts = [],
        isLoading,
        refetch,
    } = useQuery<Post[]>({
        queryKey,
        queryFn: () => postService.getPosts({ category: options.category }),
        enabled: options.enabled !== false,
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        gcTime: 1000 * 60 * 15, // Keep unused data in cache for 15 minutes
    });

    // Create post mutation
    const { mutateAsync: createPost, isPending: isCreating } = useMutation({
        mutationFn: (newPost: CreatePostOptions) => postService.createPost(newPost),
        onSuccess: (createdPost) => {
            // Update the posts cache with the new post
            queryClient.setQueryData<Post[]>(queryKey, (oldPosts = []) => {
                return [createdPost, ...oldPosts];
            });
        },
    });

    // Update post mutation
    const { mutateAsync: updatePost, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, ...updates }: Partial<CreatePostOptions> & { id: string }) =>
            postService.updatePost(id, updates),
        onSuccess: (updatedPost) => {
            // Invalidate both the post list and the individual post queries
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({
                queryKey: ["post", updatedPost.id]
            });
        },
    });

    // Delete post mutation
    const { mutateAsync: deletePost, isPending: isDeleting } = useMutation({
        mutationFn: (postId: string) => postService.deletePost(postId),
        onSuccess: (_, deletedPostId) => {
            // Remove the deleted post from the cache
            queryClient.setQueryData<Post[]>(queryKey, (oldPosts = []) => {
                return oldPosts.filter((post) => post.id !== deletedPostId);
            });
            // Also invalidate the individual post query
            queryClient.invalidateQueries({
                queryKey: ["post", deletedPostId]
            });
        },
    });

    return {
        posts,
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
            const posts = queryClient.getQueryData<Post[]>(["posts"]);
            return posts?.find(post => post.id === postId);
        },
    });
} 