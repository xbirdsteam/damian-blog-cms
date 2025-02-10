import { getAboutData, updateAboutData, updateSEO, updateTimelineItems, uploadProfileImage } from "@/services/about-service";
import { AboutData, TimelineItem } from "@/types/about";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAboutData() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["about"],
        queryFn: getAboutData,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<AboutData> }) => updateAboutData(id, updates),
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
        mutationFn: ({ id, file, path }: { id: string, file: File, path?: string }) => uploadProfileImage(id, file, path),
        onSuccess: () => {
            toast.success("Image uploaded successfully");
        },
        onError: (error) => {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image");
        },
    });

    const timelineMutation = useMutation({
        mutationFn: ({ id, timelines }: { id: string, timelines: TimelineItem[] }) => updateTimelineItems(id, timelines),
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
        mutationFn: updateSEO,
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
        uploadImage: uploadProfileImage,
        updateSEO: seoMutation.mutateAsync,
        isSaving:
            updateMutation.isPending ||
            timelineMutation.isPending ||
            uploadMutation.isPending ||
            seoMutation.isPending,
    };
} 