import { AboutData, TimelineItem } from '@/types/about';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';


export async function getAboutData() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('about_me')
        .select('*')
        .single();

    if (error) return null;
    return data as AboutData;
}

export async function updateAboutData(id: string, updates: Partial<AboutData>) {
    const supabase = createClient();
    const { error } = await supabase
        .from('about_me')
        .upsert({ ...updates, id }, { onConflict: 'id' })

    if (error) throw error;
    return true;
}

export async function updateTimelineItems(id: string, timelines: TimelineItem[]) {
    const supabase = createClient();
    const { error } = await supabase
        .from('about_me')
        .upsert({ timelines, id }, { onConflict: 'id' })

    if (error) throw error;
    return true;
}

export async function uploadProfileImage(id: string, file: File, path?: string) {
    const supabase = createClient();
    const PROFILE_IMAGE_PATH = 'about-me/profile-image';
    const fileExt = file.name.substring(file.name.lastIndexOf('.'));
    const fileName = path ? `${path}${fileExt}` : `${PROFILE_IMAGE_PATH}${fileExt}`;

    // Upload to storage with upsert to replace existing file
    const { error: uploadError } = await supabase
        .storage
        .from('images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true // Enable replacing existing file
        });

    if (uploadError) throw uploadError;

    // Construct the public URL directly
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;

    // Update profile image in database
    const { error } = await supabase
        .from('about_me')
        .upsert({ id, image_url: publicUrl }, { onConflict: 'id' })

    if (error) throw error;
    return publicUrl;
}

export async function updateSEO(seoData: {
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    og_image: string;
}) {
    const supabase = createClient();
    const { error } = await supabase
        .from('about_me')
        .upsert({ ...seoData, id: 1 }, { onConflict: 'id' });

    if (error) throw error;
    return true;
} 