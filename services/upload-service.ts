import { createClient } from "@/utils/supabase/client";

export const uploadService = {
    async uploadImage(file: File, path: string) {
        const supabase = createClient();

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const fullPath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase
            .storage
            .from('images')
            .upload(fullPath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase
            .storage
            .from('images')
            .getPublicUrl(fullPath);

        return publicUrl;
    }
}; 