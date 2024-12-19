/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/utils/supabase/client";

export interface Post {
    id?: string;
    title: string;
    slug: string;
    short_description: string;
    content: any;
    posts_categories: {
        categories: {
            id: string;
            name: string;
        }
    }[];
    categoryIds?: string[];
    publish_date?: string | null | Date;
    featured_image?: string | null;
    status: "draft" | "published";
    seo?: {
        title?: string | null;
        description?: string | null;
        keywords?: string | null;
    } | null;
    created_at: string;
    updated_at: string;
}

interface GetPostsOptions {
    category?: string;
}

export interface CreatePostOptions {
    categoryIds: string[];
    status: "draft" | "published";
    title: string;
    slug: string;
    short_description: string;
    featured_image: string;
    content: any;
    seo: {
        title?: string | null;
        description?: string | null;
        keywords?: string | null;
    } | null;
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
        const { seo, categoryIds, ...postData } = updates;

        // Start a transaction
        const { error: postError } = await supabase
            .from("posts")
            .update(
                {
                    ...postData,
                    content: postData.content ? JSON.stringify(postData.content) : "",
                    status: "draft",
                    seo_title: seo?.title || null,
                    seo_description: seo?.description || null,
                    seo_keywords: seo?.keywords || null,
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
        const { seo, categoryIds, ...postData } = post;

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
                    // Map SEO fields to database columns
                    seo_title: seo?.title || null,
                    seo_description: seo?.description || null,
                    seo_keywords: seo?.keywords || null,
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
    async getPosts(options: GetPostsOptions = {}) {
        const supabase = createClient();
        try {
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
                .order('created_at', { ascending: false });

            // Add category filter if specified
            if (options.category) {
                query = query.eq('posts_categories.category_id', options.category);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Transform the data to match our Post interface
            return (data || []).map(post => ({
                ...post,
                content: post.content ? JSON.parse(post.content) : null,
                seo: {
                    title: post.seo_title || null,
                    description: post.seo_description || null,
                    keywords: post.seo_keywords || null,
                }
            })) as Post[];
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
};