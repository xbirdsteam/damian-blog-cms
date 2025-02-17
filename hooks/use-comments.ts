import { Comment, CommentStatus, commentService } from "@/services/comment-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useComments(options?: {
  status?: CommentStatus;
  search?: string;
  post_id?: string;
  page?: number;
  perPage?: number;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['comments', options],
    queryFn: () => commentService.getComments(options),
  });

  const { mutateAsync: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CommentStatus }) =>
      commentService.updateCommentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment status updated');
    },
    onError: () => {
      toast.error('Failed to update comment status');
    },
  });

  const { mutateAsync: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => commentService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment deleted');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });

  return {
    comments: data?.comments || [],
    total: data?.total || 0,
    currentPage: data?.page || 1,
    totalPages: data?.totalPages || 0,
    perPage: data?.perPage || 10,
    isLoading,
    updateStatus,
    isUpdating,
    deleteComment,
    isDeleting,
  };
} 