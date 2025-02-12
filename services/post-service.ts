/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/utils/supabase/client";
import { Section } from "@/types/editor";

export interface Post {
    id?: string;
    title: string;
    slug: string;
    short_description: string | null;
    content: string | null;  // Content is always a string in Supabase
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

export interface CreatePostOptions {
    title: string;
    slug: string;
    short_description: string;
    post_img: string;
    status: "draft" | "published";
    categoryIds: string[];
    content: Section[]; // This will store all sections
    publish_date: Date | null;
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

    async updatePost(id: string, options: Partial<CreatePostOptions>) {
        const supabase = createClient();
        const updates: any = {
            updated_at: new Date().toISOString(),
        };

        // Only include fields that are provided
        if (options.title) updates.title = options.title;
        if (options.slug) updates.slug = options.slug;
        if (options.short_description) updates.short_description = options.short_description;
        if (options.post_img) updates.post_img = options.post_img;
        if (options.status) updates.status = options.status;
        if (options.content) updates.content = JSON.stringify(options.content);
        if (options.publish_date) updates.publish_date = options.publish_date;

        // Get the post's created_at timestamp
        const { data: currentPost } = await supabase
            .from("posts")
            .select("created_at")
            .eq("id", id)
            .single();

        if (!currentPost) throw new Error("Post not found");

        const { data, error } = await supabase
            .from("posts")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        // Update categories if provided
        if (options.categoryIds) {
            await supabase
                .from("posts_categories")
                .delete()
                .eq("post_id", id);

            const categoryRelations = options.categoryIds.map(categoryId => ({
                post_id: id,
                category_id: categoryId,
            }));

            const { error: relationError } = await supabase
                .from("posts_categories")
                .insert(categoryRelations);

            if (relationError) throw relationError;
        }

        return data;
    },

    async createPost(options: CreatePostOptions) {
        const supabase = createClient();
        const now = new Date().toISOString();

        // Create the post first to get its ID
        const { data, error } = await supabase.from("posts").insert({
            title: options.title,
            slug: options.slug,
            short_description: options.short_description,
            post_img: options.post_img,
            status: options.status,
            content: JSON.stringify(options.content),
            created_at: now,
            updated_at: now,
            publish_date: options.publish_date,
        }).select().single();

        if (error) throw error;

        // Handle category relationships
        if (options.categoryIds.length > 0) {
            const categoryRelations = options.categoryIds.map(categoryId => ({
                post_id: data.id,
                category_id: categoryId,
            }));

            const { error: relationError } = await supabase
                .from("posts_categories")
                .insert(categoryRelations);

            if (relationError) throw relationError;
        }

        return data;
    },

    async getPosts(options?: {
        categories?: string[];
        page?: number;
        perPage?: number;
        search?: string;
    }) {
        const supabase = createClient();
        const page = options?.page || 1;
        const perPage = options?.perPage || 10;
        const start = (page - 1) * perPage;
        const end = start + perPage - 1;

        // First, get post IDs that match the category filter
        let postIds: string[] = [];
        if (options?.categories && options.categories.length > 0) {
            const { data: filteredPosts } = await supabase
                .from('posts_categories')
                .select(`
                    post_id
                `)
                .in('category_id', options.categories);

            postIds = Array.from(new Set(filteredPosts?.map(p => p.post_id) || []));
        }

        // Now get the full post data
        let query = supabase
            .from('posts')
            .select(`
                *,
                posts_categories (
                    category_id,
                    categories (
                        id,
                        name
                    )
                )
            `, { count: 'exact' });

        // Add search filter if provided
        if (options?.search) {
            query = query.or(`title.ilike.%${options.search}%,short_description.ilike.%${options.search}%`);
        }

        // Add category filter using post IDs if categories were selected
        if (options?.categories && options.categories.length > 0) {
            if (postIds.length === 0) {
                return {
                    posts: [],
                    currentPage: page,
                    perPage,
                    total: 0,
                    totalPages: 0,
                };
            }
            query = query.in('id', postIds);
        }

        // Add pagination and ordering
        const { data: posts, error, count } = await query
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) throw error;

        return {
            posts: (posts || []) as Post[],
            currentPage: page,
            perPage,
            total: count || 0,
            totalPages: count ? Math.ceil(count / perPage) : 0,
        };
    },

    async getPost(id: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("posts")
            .select(`
                *,
                posts_categories (
                    categories (
                        id,
                        name
                    )
                )
            `)
            .eq("id", id)
            .single();

        if (error) throw error;

        // No need to parse content here, return it as is
        return data;
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
    },
};