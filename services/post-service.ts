/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/utils/supabase/client";

export interface Post {
    id?: string;
    title: string;
    slug: string;
    short_description: string | null;
    content: string | null;
    posts_categories: {
        categories: {
            id: string;
            name: string;
        }
    }[];
    post_img: string | null;
    status: "draft" | "published";
    publish_date: Date | null;
    created_at: string;
    updated_at: string;
}

interface GetPostsOptions {
    category?: string;
    page?: number;
    perPage?: number;
}

export interface CreatePostOptions {
    categoryIds: string[];
    status: "draft" | "published";
    title: string;
    slug: string;
    short_description: string | null;
    post_img: string | null;
    content: any;
}

export interface PostStats {
    totalPosts: number;
    byStatus: {
        published: number;
        draft: number;
    };
    byCategory: {
        categoryId: string;
        categoryName: string;
        count: number;
    }[];
}

export interface PaginatedPosts {
    posts: Post[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

export const postService = {
    async generateSlug(title: string, existingId?: string) {
        const supabase = createClient();

        // Convert title to slug format
        const baseSlug = title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')  // Remove special characters
            .replace(/\s+/g, '-')      // Replace spaces with hyphens
            .replace(/-+/g, '-');      // Replace multiple hyphens with single hyphen

        let slug = baseSlug;
        let counter = 1;

        // Keep checking until we find a unique slug
        while (true) {
            const { data, error } = await supabase
                .from("posts")
                .select("id")
                .eq("slug", slug)
                .maybeSingle();

            if (error) throw error;

            // If no post found with this slug, or if found post is the one we're updating
            if (!data || data.id === existingId) {
                return slug;
            }

            // Try next counter
            counter++;
            slug = `${baseSlug}-${counter}`;
        }
    },

    async updatePost(id: string, updates: Partial<CreatePostOptions>) {
        const supabase = createClient();
        const { categoryIds, ...postData } = updates;

        // Start a transaction
        const { error: postError } = await supabase
            .from("posts")
            .update(
                {
                    ...postData,
                    content: postData.content ? JSON.stringify(postData.content) : "",
                    id
                },
            ).eq("id", id)

        if (postError) throw postError;

        // Update categories using categoryIds
        if (categoryIds && categoryIds.length > 0) {
            const categoryLinks = categoryIds.map(categoryId => ({
                post_id: id,
                category_id: categoryId
            }));

            // Delete existing category links
            await supabase
                .from('posts_categories')
                .delete()
                .eq('post_id', id);

            // Insert new category links
            const { error: categoryError } = await supabase
                .from('posts_categories')
                .insert(categoryLinks);

            if (categoryError) throw categoryError;
        }

        // Transform the response to match our interface
        return { id }
    },

    async createPost(post: CreatePostOptions) {
        const supabase = createClient();
        const { categoryIds, ...postData } = post;
        // Generate unique slug if title is provided and no slug exists
        const slug = postData.title && !postData.slug ? await this.generateSlug(postData.title) : postData.slug;
        // Start a transaction
        const { data: newPost, error: postError } = await supabase
            .from("posts")
            .insert(
                {
                    ...postData,
                    slug,
                    content: postData.content ? JSON.stringify(postData.content) : null,
                }
            )
            .select()
            .single();

        if (postError) throw postError;

        // Update categories using categoryIds
        if (categoryIds && categoryIds.length > 0) {
            const categoryLinks = categoryIds.map(categoryId => ({
                post_id: newPost.id,
                category_id: categoryId
            }));

            // Delete existing category links
            await supabase
                .from('posts_categories')
                .delete()
                .eq('post_id', newPost.id);

            // Insert new category links
            const { error: categoryError } = await supabase
                .from('posts_categories')
                .insert(categoryLinks);

            if (categoryError) throw categoryError;
        }


        // Transform the response to match our interface
        return {
            ...newPost,
            content: newPost.content ? JSON.parse(newPost.content) : null,
            seo: {
                title: newPost.seo_title || null,
                description: newPost.seo_description || null,
                keywords: newPost.seo_keywords || null,
            },
        };
    },
    async getPosts(options: GetPostsOptions = {}): Promise<PaginatedPosts> {
        const supabase = createClient();
        const page = options.page || 1;
        const perPage = options.perPage || 2;
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        try {
            // First get total count
            const countQuery = supabase
                .from("posts")
                .select('id', { count: 'exact' });

            if (options.category) {
                countQuery.eq('posts_categories.category_id', options.category);
            }

            const { count, error: countError } = await countQuery;
            if (countError) throw countError;

            // Then get paginated data
            let query = supabase
                .from("posts")
                .select(`
                    *,
                    posts_categories!inner (
                        categories (
                            id,
                            name
                        )
                    )
                `)
                .order('created_at', { ascending: false })
                .range(from, to);

            // Add category filter if specified
            if (options.category) {
                query = query.eq('posts_categories.category_id', options.category);
            }

            const { data, error } = await query;
            if (error) throw error;

            const totalPages = Math.ceil((count || 0) / perPage);

            // Transform the data to match our Post interface
            const posts = (data || []).map(post => ({
                ...post,
                content: post.content ? JSON.parse(post.content) : null,
                seo: {
                    title: post.seo_title || null,
                    description: post.seo_description || null,
                    keywords: post.seo_keywords || null,
                }
            })) as Post[];

            return {
                posts,
                total: count || 0,
                page,
                perPage,
                totalPages,
            };
        } catch (error) {
            console.error("Error fetching posts:", error);
            throw error;
        }
    },
    async getPost(id: string) {
        const supabase = createClient();
        const { data: post, error } = await supabase
            .from("posts")
            .select(`
                *,
                    posts_categories!inner (
                        categories (
                            id,
                            name
                        )
                    )
            `)
            .eq("id", id)
            .single();

        if (error) throw error;
        if (!post) return null;

        return {
            ...post,
            content: post.content ? JSON.parse(post.content) : null,
            seo: {
                title: post.seo_title || null,
                description: post.seo_description || null,
                keywords: post.seo_keywords || null,
            }
        };
    },
    async deletePost(id: string) {
        const supabase = createClient();

        try {
            // Delete the post
            const { error } = await supabase
                .from("posts")
                .delete()
                .eq("id", id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    },
    async getPostStats(): Promise<PostStats> {
        const supabase = createClient();

        // Fetch all categories first
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('id, name');

        if (categoriesError) throw categoriesError;

        // Fetch posts with their categories
        const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select(`
                id,
                status,
                posts_categories!inner (
                    categories (
                        id,
                        name
                    )
                )
            `);

        if (postsError) throw postsError;

        const stats: PostStats = {
            totalPosts: posts.length,
            byStatus: {
                published: posts.filter(post => post.status === 'published').length,
                draft: posts.filter(post => post.status === 'draft').length
            },
            byCategory: []
        };

        // Initialize counts for all categories
        const categoryMap = new Map<string, { name: string; count: number }>();

        // Initialize all categories with 0 count
        categories.forEach(category => {
            categoryMap.set(category.id, {
                name: category.name,
                count: 0
            });
        });

        // Update counts for categories that have posts
        posts.forEach((post: any) => {
            post.posts_categories.forEach(pc => {
                const { categories } = pc;
                if (!categories) return;

                const categoryId = categories.id;
                const current = categoryMap.get(categoryId);

                if (current) {
                    current.count++;
                }
            });
        });

        // Convert map to array format
        stats.byCategory = Array.from(categoryMap.entries())
            .map(([categoryId, data]) => ({
                categoryId,
                categoryName: data.name,
                count: data.count
            }))
            .sort((a, b) => b.count - a.count); // Sort by count in descending order

        return stats;
    }
};