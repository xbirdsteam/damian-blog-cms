import { settingsService, UpdateLayoutOptions } from "@/services/settings-service";
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

    return {
        data,
        isLoading,
        updateLayout,
        isSavingLayout,
    };
}