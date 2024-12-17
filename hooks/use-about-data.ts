import { AboutData, TimelineItem } from "@/types/about";
import { createClient } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const supabase = createClient();

export function useAboutData() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["about"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("about")
                .select("*")
                .single();

            if (error) throw error;
            return data as AboutData;
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: Partial<AboutData>) => {
            const { error } = await supabase
                .from("about")
                .update(data)
                .eq("id", 1);

            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["about"] });
            toast.success("Changes saved successfully");
        },
        onError: (error) => {
            console.error("Error updating about data:", error);
            toast.error("Failed to save changes");
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async ({ file, path }: { file: File; path?: string }) => {
            const fileExt = file.name.substring(file.name.lastIndexOf("."));
            const fileName = path ? `${path}${fileExt}` : `profile${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("images")
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from("images")
                .getPublicUrl(fileName);

            if (!path) {
                await updateMutation.mutateAsync({
                    image_url: data.publicUrl,
                });
            }

            return data.publicUrl;
        },
        onSuccess: () => {
            toast.success("Image uploaded successfully");
        },
        onError: (error) => {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image");
        },
    });

    const timelineMutation = useMutation({
        mutationFn: async (timeline: TimelineItem[]) => {
            const { error } = await supabase
                .from("about")
                .update({ timeline })
                .eq("id", 1);

            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["about"] });
            toast.success("Timeline updated successfully");
        },
        onError: (error) => {
            console.error("Error updating timeline:", error);
            toast.error("Failed to update timeline");
        },
    });

    const seoMutation = useMutation({
        mutationFn: async (data: {
            seo_title: string;
            seo_description: string;
            seo_keywords: string;
            og_image: string | null;
        }) => {
            const { error } = await supabase
                .from("about")
                .update(data)
                .eq("id", 1);

            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["about"] });
            toast.success("SEO settings updated successfully");
        },
        onError: (error) => {
            console.error("Error updating SEO settings:", error);
            toast.error("Failed to update SEO settings");
        },
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        updateData: updateMutation.mutateAsync,
        updateTimeline: timelineMutation.mutateAsync,
        uploadImage: uploadMutation.mutateAsync,
        updateSEO: seoMutation.mutateAsync,
        isSaving:
            updateMutation.isPending ||
            timelineMutation.isPending ||
            uploadMutation.isPending ||
            seoMutation.isPending,
    };
} 