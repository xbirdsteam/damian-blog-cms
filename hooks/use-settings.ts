import { settingsService, Settings, UpdateLayoutOptions } from "@/services/settings-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSettings() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings,
    });

    const { mutateAsync: updateLayout, isPending: isSavingLayout } = useMutation({
        mutationFn: (options: UpdateLayoutOptions) => settingsService.updateLayout(options),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success("Settings updated successfully");
        },
        onError: (error) => {
            console.error("Error updating settings:", error);
            toast.error("Failed to update settings");
        },
    });

    const { mutateAsync: uploadLogo, isPending: isUploading } = useMutation({
        mutationFn: ({ file, type }: { file: File; type: "header" | "footer" }) =>
            settingsService.uploadLogo(file, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success("Logo uploaded successfully");
        },
        onError: (error) => {
            console.error("Error uploading logo:", error);
            toast.error("Failed to upload logo");
        },
    });

    return {
        data,
        isLoading,
        updateLayout,
        isSavingLayout,
        uploadLogo,
        isUploading,
    };
}