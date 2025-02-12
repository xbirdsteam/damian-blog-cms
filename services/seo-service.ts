import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface SEOConfig {
    id?: string;
    seo_ref_id: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    og_image?: string | null;
    slug: string;
    created_at?: string;
    updated_at?: string;
}

export const seoService = {
    async getSEOConfig(refId: string, slug: string) {
        if (!refId || !slug) return null;
        const { data, error } = await supabase
            .from('seo_config')
            .select('*')
            .eq('seo_ref_id', refId)
            .eq('slug', slug)
            .single();

        if (error) return null;
        return data as SEOConfig;
    },

    async updateSEOConfig(config: Partial<SEOConfig>) {
        const { error } = await supabase
            .from('seo_config')
            .upsert({
                ...config,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return true;
    }
}; 