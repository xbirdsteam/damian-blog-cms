import { getSettings, updateNavigation, uploadLogo, updateFooter } from "@/services/settings-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSettings() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["settings"],
        queryFn: getSettings,
    });

    const uploadLogoMutation = useMutation({
        mutationFn: uploadLogo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            toast.success("Logo updated successfully");
        },
        onError: (error) => {
            console.error("Error updating logo:", error);
            toast.error("Failed to update logo");
        },
    });

    const updateNavigationMutation = useMutation({
        mutationFn: updateNavigation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            toast.success("Navigation updated successfully");
        },
        onError: (error) => {
            console.error("Error updating navigation:", error);
            toast.error("Failed to update navigation");
        },
    });

    const updateFooterMutation = useMutation({
        mutationFn: updateFooter,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            toast.success("Footer settings updated successfully");
        },
        onError: (error) => {
            console.error("Error updating footer:", error);
            toast.error("Failed to update footer settings");
        },
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        uploadLogo: uploadLogoMutation.mutateAsync,
        updateNavigation: updateNavigationMutation.mutateAsync,
        isUploading: uploadLogoMutation.isPending,
        isSaving: updateNavigationMutation.isPending,
        updateFooter: updateFooterMutation.mutateAsync,
        isSavingFooter: updateFooterMutation.isPending,
    };
} 