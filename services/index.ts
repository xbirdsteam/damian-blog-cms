import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_ENDPOINT;

export async function uploadImage(file: File, path: string) {
  try {
    const supabase = createClient();

    // Generate unique filename to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const fullPath = `${path}/${fileName}`;

    // Upload the file
    const { error } = await supabase
      .storage
      .from('images')
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Construct URL directly
    return `${STORAGE_URL}/images/${fullPath}`;

  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function uploadVideo(file: File, path: string) {
  try {
    const supabase = createClient();

    // Generate unique filename to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const fullPath = `${path}/${fileName}`;

    // Upload the file
    const { error } = await supabase
      .storage
      .from('videos')
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Construct URL directly
    return `${STORAGE_URL}/videos/${fullPath}`;

  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
}

export async function deleteFile(path: string, bucket: 'images' | 'videos') {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(`Error deleting file from ${bucket}:`, error);
    throw error;
  }
}

// Helper function to get path from URL
export function getPathFromUrl(url: string, bucket: 'images' | 'videos'): string | null {
  try {
    // Get everything after the bucket name
    const [,pathParts] = url.split(`${STORAGE_URL}/${bucket}/` || '');
    return pathParts
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

// Example usage:
// const imageUrl = await uploadImage(file, 'posts/featured-images');
// const imageUrl = await uploadImage(file, 'about/profile');
// const imageUrl = await uploadImage(file, 'seo/og-images');
// const videoUrl = await uploadVideo(file, 'recipes/videos');

// Delete an image
// const path = getPathFromUrl(imageUrl);
// if (path) await deleteFile(path, 'images');

// Delete a video
// const path = getPathFromUrl(videoUrl);
// if (path) await deleteFile(path, 'videos');
