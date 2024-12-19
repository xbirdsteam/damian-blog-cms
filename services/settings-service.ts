import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface NavigationItem {
    label: string;
    url: string;
}

export interface HeaderSettings {
    logo_url: string;
    navigation: NavigationItem[];
}

export interface FooterSettings {
    social_links: {
        [key: string]: string;
    };
}

export interface Settings extends HeaderSettings, FooterSettings { }

export async function uploadLogo(file: File) {
    const LOGO_PATH = 'settings/logo';
    const fileExt = file.name.substring(file.name.lastIndexOf('.'));
    const fileName = `${LOGO_PATH}${fileExt}`;

    // Upload to storage with upsert to replace existing file
    const { error: uploadError } = await supabase
        .storage
        .from('images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (uploadError) throw uploadError;

    // Construct the public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;

    // Update settings in database
    const { error } = await supabase
        .from('settings')
        .upsert({ logo_url: publicUrl, id: 1 }, { onConflict: 'id' })

    if (error) throw error;
    return publicUrl;
}

export async function updateNavigation(navigation: NavigationItem[]) {
    const { error } = await supabase
        .from('settings')
        .upsert({ navigation, id: 1 }, { onConflict: 'id' })

    if (error) throw error;
    return true;
}

export async function getSettings() {
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

    if (error) return null;
    return data as Settings;
}

export async function updateFooter(settings: FooterSettings) {
    const { error } = await supabase
        .from('settings')
        .upsert({
            social_links: settings.social_links,
            id: 1
        }, { onConflict: 'id' })

    if (error) throw error;
    return true;
} 