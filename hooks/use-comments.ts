import { CommentStatus, PaginatedComments, commentService } from "@/services/comment-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useComments() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedComments>({
    queryKey: ['comments'],
    queryFn: () => commentService.getComments(),
  });

  const { mutateAsync: updateStatus } = useMutation({
    mutationFn: (variables: { id: string; status: CommentStatus }) => 
      commentService.updateCommentStatus(variables.id, variables.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const approveComment = async (id: string) => {
    try {
      await updateStatus({ id, status: 'approved' });
      toast.success('Comment approved successfully');
    } catch (error) {
      toast.error('Failed to approve comment');
    }
  };

  const rejectComment = async (id: string) => {
    try {
      await updateStatus({ id, status: 'trash' });
      toast.success('Comment moved to trash');
    } catch (error) {
      toast.error('Failed to move comment to trash');
    }
  };

  return {
    data,
    isLoading,
    approveComment,
    rejectComment
  };
} 