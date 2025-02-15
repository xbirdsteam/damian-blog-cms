import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface SEOConfig {
    id?: string;
    seo_ref_id: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    og_image?: string | null;
    og_twitter_image?: string | null;
    slug: string;
    created_at?: string;
    updated_at?: string;
}

export const seoService = {
    async getSEOConfig(refId: string) {
        if (!refId) return null;
        const { data, error } = await supabase
            .from('seo_config')
            .select('*')
            .eq('seo_ref_id', refId)
            .single();

        if (error) return null;
        return data as SEOConfig;
    },

    async updateSEOConfig(config: Partial<SEOConfig>) {
        const { error } = await supabase
            .from('seo_config')
            .upsert(
                {
                    ...config,
                    updated_at: new Date().toISOString(),
                    created_at: new Date().toISOString(), // Only used for new records
                },
                {
                    onConflict: 'seo_ref_id',
                    ignoreDuplicates: false,
                }
            );

        if (error) throw error;
        return true;
    }
}; 