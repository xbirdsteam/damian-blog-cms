import { createClient } from "@/utils/supabase/client";

export type CommentStatus = "unapproved" | "approved" | "trash";

export interface Comment {
  id: string;
  parent_id?: string | null;
  content: string;
  post_id: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_email: string;
  avatar_url?: string | null;
  status: CommentStatus;
  post?: {
    title: string;
    slug: string;
  };
  replies?: Comment[];
}

export interface PaginatedComments {
  comments: Comment[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export const commentService = {
  async getComments(options?: { 
    status?: CommentStatus;
    search?: string;
    post_id?: string;
    page?: number;
    perPage?: number;
  }): Promise<PaginatedComments> {
    const supabase = createClient();
    const page = options?.page || 1;
    const perPage = options?.perPage || 10;
    const start = (page - 1) * perPage;
    const end = start + perPage - 1;
    
    let query = supabase
      .from('comments')
      .select(`
        *,
        post:posts(title, slug),
        replies:comments!parent_id(*)
      `, { count: 'exact' })
      .is('parent_id', null); // Get only parent comments

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.search) {
      query = query.or(`content.ilike.%${options.search}%,author_name.ilike.%${options.search}%,author_email.ilike.%${options.search}%`);
    }

    if (options?.post_id) {
      query = query.eq('post_id', options.post_id);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    return {
      comments: data as Comment[],
      total: count || 0,
      page,
      perPage,
      totalPages: count ? Math.ceil(count / perPage) : 0,
    };
  },

  async updateCommentStatus(id: string, status: CommentStatus) {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('comments')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async deleteComment(id: string) {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}; 