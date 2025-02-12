import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient();

export interface NavigationItem {
    label: string;
    url: string;
}

export interface HeaderSettings {
    logo_url: string;
    navigation: NavigationItem[];
    footer_logo: string;
}

export interface FooterSettings {
    social_links: {
        [key: string]: string;
    };
}

export interface Settings {
    id: string;
    social_links?: {
        instagram?: string;
        youtube?: string;
        linkedin?: string;
        pinterest?: string;
        tiktok?: string;
    };
    header_logo?: string | null;
    footer_logo?: string | null;
}

export interface UpdateLayoutOptions {
    id: string;
    settings?: {
        social_links?: Settings['social_links'];
    };
    header_logo?: string | null;
    footer_logo?: string | null;
}

export const settingsService = {
    async getSettings() {
        const { data, error } = await supabase
            .from('layouts')
            .select('*')
            .single();

        if (error) {
            // Create initial settings row if none exists
            const initialSettings = {
                id: uuidv4(),
                social_links: {
                    instagram: '',
                    youtube: '',
                    linkedin: '',
                    pinterest: '',
                    tiktok: ''
                },
                header_logo: null,
                footer_logo: null
            };

            const { data: newData, error: createError } = await supabase
                .from('layouts')
                .insert(initialSettings)
                .select()
                .single();

            if (createError) throw createError;
            return newData as Settings;
        }

        return data as Settings;
    },

    async updateLayout(options: UpdateLayoutOptions) {
        const { error } = await supabase
            .from('layouts')
            .upsert({
                id: options.id,
                social_links: options.settings?.social_links,
                header_logo: options.header_logo,
                footer_logo: options.footer_logo,
            })
            .select()
            .single();

        if (error) throw error;
        return true;
    },

    async uploadLogo(file: File, type: 'header' | 'footer') {
        const LOGO_PATH = `layouts/${type}_logo`;
        const fileExt = file.name.substring(file.name.lastIndexOf('.'));
        const fileName = `${LOGO_PATH}${fileExt}`;

        const { error: uploadError } = await supabase
            .storage
            .from('images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data } = supabase
            .storage
            .from('images')
            .getPublicUrl(fileName);

        return data.publicUrl;
    },

    async updateFooter(id: string, settings: FooterSettings) {
        const { error } = await supabase
            .from('layouts')
            .upsert({
                social_links: settings.social_links,
                id: id
            }, { onConflict: 'id' })

        if (error) throw error;
        return true;
    }
}; 