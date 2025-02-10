import { createClient } from "@/utils/supabase/client";

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
    hero_desktop_img_url: string;
    hero_mobile_img_url: string;
    about_title: string;
    about_bio: string;
    about_description: string;
    about_img_url: string;
    about_more_url: string;
    recipe_title: string;
    recipe_heading: string;
    recipe_description: string;
    recipe_video_url: string;
    recipe_more_url: string;
    contact_title: string;
    contact_heading: string;
    contact_subheading: string;
    contact_text: string;
    contact_description: string;
    contact_receiver_email: string;
    contact_button_url: string;
    contact_industry_options: any[];
}

export interface UploadImageParams {
    file: File;
    path: string;
}

export async function getHomeSettings() {
    const { data, error } = await supabase
        .from('home')
        .select('*')
        .single();

    if (error) return null;
    return data as HomeSettings;
}

export async function updateHomeSettings(settings: HomeSettings) {
    const { error } = await supabase
        .from('home')
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
                .from('home')
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
            .from('home')
            .insert({
                hero_desktop_img_url: '',
                hero_mobile_img_url: '',
                about_title: '',
                about_bio: '',
                about_description: '',
                about_img_url: '',
                about_more_url: '',
                recipe_title: '',
                recipe_heading: '',
                recipe_description: '',
                recipe_video_url: '',
                recipe_more_url: '',
                contact_title: '',
                contact_heading: '',
                contact_subheading: '',
                contact_text: '',
                contact_description: '',
                contact_receiver_email: '',
                contact_button_url: '',
                contact_industry_options: [],
            })
            .select()
            .single();
        console.log(error)
        if (error) throw error;
        return data;
    },

    async updateHomeImages(id: string, updates: Partial<HomeSettings>) {
        const { data, error } = await supabase
            .from('home')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateHomeSection(id: string, updates: Partial<HomeSettings>) {
        const { data, error } = await supabase
            .from('home')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
}; 