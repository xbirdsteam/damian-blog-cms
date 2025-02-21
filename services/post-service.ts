import { Section } from "@/types/editor";
import { createClient } from "@/utils/supabase/client";

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
    categoryIds: string[];
    tags: string[];
    author_id: string;
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
    tags: string[];
    author_id: string;
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

export enum PostStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
}

export interface PostDetail {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    content: string;
    status: PostStatus;
    publish_date: string;
    post_img: string;
    created_at: string;
    updated_at: string;
    posts_categories?: PostsCategories[];
    next_post?: {
        title: string;
        slug: string;
    } | null;
    prev_post?: {
        title: string;
        slug: string;
    } | null;
    tags?: string[];
}

export interface PostsCategories {
    categories: {
        id: number;
        name: string;
    }
}

interface GetPostsOptions {
    page?: number;
    perPage?: number;
    categories?: string[];
    search?: string;
    status?: string;
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
        if (options.tags) updates.tags = options.tags;
        if (options.author_id) updates.author_id = options.author_id;
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
            tags: options.tags,
            author_id: options.author_id,
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

    async getPosts({ page = 1, perPage = 10, categories, search, status }: GetPostsOptions = {}) {
        const supabase = createClient();
        
        // First, get post IDs that match the category filter if categories are selected
        let postIds: string[] = [];
        if (categories?.length) {
            const { data: filteredPosts } = await supabase
                .from('posts_categories')
                .select('post_id')
                .in('category_id', categories);

            postIds = Array.from(new Set(filteredPosts?.map(p => p.post_id) || []));
            
            // If no posts found for selected categories, return empty result
            if (postIds.length === 0) {
                return {
                    posts: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                    }
                };
            }
        }

        // Now get the full post data
        let query = supabase
            .from('posts')
            .select(`
                *,
                posts_categories (
                    categories (
                        id,
                        name
                    )
                )
            `, { count: 'exact' });

        // Apply filters
        if (categories?.length) {
            query = query.in('id', postIds);
        }

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        if (status) {
            query = query.eq('status', status);
        }

        // Add pagination
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return {
            posts: data || [],
            pagination: {
                currentPage: page,
                totalPages: Math.ceil((count || 0) / perPage),
            },
        };
    },

    async getPost(id: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("posts")
            .select(`
                *,
                posts_categories(
                    categories(
                        id,
                        name
                    )
                )
            `)
            .eq("id", id)
            .single();

        if (error) throw error;

        // Transform the data to match the Post interface
        return {
            ...data,
            categoryIds: data.posts_categories.map(
                (pc: any) => pc.categories.id
            ),
            tags: data.tags || [], // Ensure tags is always an array
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
    },

    async generateUniqueSlug(title: string, currentPostId?: string | null) {
        const supabase = createClient();
        
        // Generate base slug from title
        let slug = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')    // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, '')        // Remove leading/trailing hyphens
            .substring(0, 60);              // Limit length
        
        // Check if slug exists
        const { data: existingPost } = await supabase
            .from('posts')
            .select('id, slug')
            .eq('slug', slug)
            .neq('id', currentPostId || '')  // Exclude current post if updating
            .single();

        if (existingPost) {
            // If slug exists, add incremental number
            let counter = 1;
            let newSlug = slug;
            
            while (true) {
                newSlug = `${slug}-${counter}`;
                
                const { data: checkPost } = await supabase
                    .from('posts')
                    .select('id')
                    .eq('slug', newSlug)
                    .neq('id', currentPostId || '')
                    .single();
                
                if (!checkPost) break;
                counter++;
            }
            
            slug = newSlug;
        }

        return slug;
    },
    getPostBySlug :async (slug: string): Promise<PostDetail | null> => {
        const supabase = createClient()
    
        // Get the main post with categories
        const { data: post, error } = await supabase
            .from('posts')
            .select(`
                *,
                posts_categories (
                    categories (
                        id,
                        name
                    )
                )
            `)
            .eq('slug', slug)
            .single()
    
        if (error || !post) {
            return null
        }
    
        // Get next and previous posts based on created_at
        const [prevPostResult, nextPostResult] = await Promise.all([
            supabase
                .from('posts')
                .select('title, slug')
                .eq('status', 'published')
                .lt('created_at', post.created_at)
                .order('created_at', { ascending: false })
                .limit(1)
                .single(),
            supabase
                .from('posts')
                .select('title, slug')
                .eq('status', 'published')
                .gt('created_at', post.created_at)
                .order('created_at', { ascending: true })
                .limit(1)
                .single()
        ])
    
        return {
            ...post,
            prev_post: prevPostResult.data,
            next_post: nextPostResult.data
        }
    }
};