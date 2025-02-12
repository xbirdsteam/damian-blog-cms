import { seoService, SEOConfig } from "@/services/seo-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSEO(refId: string, slug: string) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['seo', refId, slug],
        queryFn: () => seoService.getSEOConfig(refId, slug),
    });

    const { mutateAsync: updateSEO, isPending: isUpdating } = useMutation({
        mutationFn: (config: Partial<SEOConfig>) => seoService.updateSEOConfig(config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seo', refId, slug] });
            toast.success("SEO settings updated successfully");
        },
        onError: (error) => {
            console.error("Error updating SEO settings:", error);
            toast.error("Failed to update SEO settings");
        },
    });

    return {
        seoConfig: data,
        isLoading,
        updateSEO,
        isUpdating,
    };
} 