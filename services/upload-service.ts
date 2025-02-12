import { createClient } from "@/utils/supabase/client";

export const uploadService = {
    async uploadImage(file: File): Promise<string> {
        const supabase = createClient();

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `post-images/${fileName}`;

        const { data, error } = await supabase
            .storage
            .from('images')
            .upload(filePath, file);

        if (error) {
            throw error;
        }

        const { data: { publicUrl } } = supabase
            .storage
            .from('images')
            .getPublicUrl(filePath);

        return publicUrl;
    }
}; 