import { createClient } from "@/lib/supabase";

const supabase = createClient();

export interface HeroSection {
    title: string;
    subtitle: string;
    image_url: string;
}

export interface Project {
    title: string;
    description: string;
    image_url: string;
    link?: string;
}

export interface HomeSettings {
    id: string;
    hero_image_url: string;
    hero_mobile_image_url: string;
    about_title: string;
    about_description: string;
    about_image_url: string;
    about_more_url: string;
    created_at: string;
    updated_at: string;
    recipes_title: string;
    recipes_description: string;
    recipes_video_url: string;
    recipes_more_url: string;
    contact_title: string;
    contact_description: string;
    contact_receiver_email: string;
    contact_industries: string[];
}

export interface UploadImageParams {
    file: File;
    path: string;
}

export async function getHomeSettings() {
    const { data, error } = await supabase
        .from('home_settings')
        .select('*')
        .single();

    if (error) throw error;
    return data as HomeSettings;
}

export async function updateHomeSettings(settings: HomeSettings) {
    const { error } = await supabase
        .from('home_settings')
        .update(settings)
        .eq('id', 1);

    if (error) throw error;
    return true;
}

export async function uploadHomeImage({ file, path }: UploadImageParams) {
    try {

        const fileExt = file.name.substring(file.name.lastIndexOf('.'));
        const fileName = `${path}${fileExt}`;


        const { error: uploadError } = await supabase
            .storage
            .from('images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
        }


        const { data: { publicUrl } } = supabase
            .storage
            .from('images')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('Error in uploadHomeImage:', error);
        throw error;
    }
}

export const homeService = {
    async getHomeSettings() {
        try {
            const { data, error } = await supabase
                .from('home_settings')
                .select('*')
                .single();

            if (error) {
                // If no record exists, create one
                if (error.code === 'PGRST116') {
                    console.log('No home settings found, creating new record');
                    return await homeService.createHomeSettings();
                }
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error fetching home settings:', error);
            throw error;
        }
    },

    async createHomeSettings() {
        const { data, error } = await supabase
            .from('home_settings')
            .insert({
                hero_image_url: '',
                hero_mobile_image_url: '',
                about_title: '',
                about_description: '',
                about_image_url: '',
                about_more_url: '',
                recipes_title: '',
                recipes_description: '',
                recipes_video_url: '',
                recipes_more_url: '',
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateHomeImages(id: string, updates: Partial<HomeSettings>) {
        const { data, error } = await supabase
            .from('home_settings')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateHomeSection(id: string, updates: Partial<HomeSettings>) {
        const { data, error } = await supabase
            .from('home_settings')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
}; 