import { AboutData, TimelineItem } from '@/types/about';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

export async function getAboutData() {
    const { data, error } = await supabase
        .from('about')
        .select('*')
        .single();

    if (error) throw error;
    return data as AboutData;
}

export async function updateAboutData(updates: Partial<AboutData>) {
    const { error } = await supabase
        .from('about')
        .update(updates)
        .eq('id', 1) // Assuming we're always updating the first record

    if (error) throw error;
    return true;
}

export async function updateTimelineItems(timeline: TimelineItem[]) {
    const { error } = await supabase
        .from('about')
        .update({ timeline })
        .eq('id', 1)
        .select()
        .single();

    if (error) throw error;
    return true;
}

export async function uploadProfileImage(file: File) {
    const PROFILE_IMAGE_PATH = 'about-me/profile-image';
    const fileExt = file.name.substring(file.name.lastIndexOf('.'));
    const fileName = `${PROFILE_IMAGE_PATH}${fileExt}`;

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
        .from('about')
        .update({ image_url: publicUrl })
        .eq('id', 1)

    if (error) throw error;
    return true;
}

export async function updateSEO(seoData: {
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
}) {
    const { error } = await supabase
        .from('about')
        .update(seoData)
        .eq('id', 1);

    if (error) throw error;
    return true;
} 