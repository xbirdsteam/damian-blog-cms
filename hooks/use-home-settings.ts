import { useState } from 'react';
import { homeService, HomeSettings } from '@/services/home-service';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useHomeSettings = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch home settings
    const {
        data,
        isLoading: isInitialLoading,  // Only true on first load
        refetch
    } = useQuery({
        queryKey: ['home-settings'],
        queryFn: homeService.getHomeSettings,
        // Prevent automatic refetching
        staleTime: Infinity,
        // Keep previous data while refetching
        placeholderData: keepPreviousData,
    });

    const handleImageUpdate = async (
        id: string,
        type: "desktop" | "mobile",
        url: string
    ) => {
        try {
            setIsUpdating(true);
            setError(null);

            const updates = type === "desktop"
                ? { hero_image_url: url }
                : { hero_mobile_image_url: url };

            await homeService.updateHomeImages(id, updates);

            // Silently update the cache with new data
            await refetch({ cancelRefetch: true });

        } catch (err) {
            console.error('Error in handleImageUpdate:', err);
            setError(err instanceof Error ? err.message : 'Failed to update images');
            throw err;
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSectionUpdate = async (
        id: string,
        section: "about" | "hero" | "recipes" | "contact" | "seo",
        updates: Partial<HomeSettings>
    ) => {
        try {
            setIsUpdating(true);
            setError(null);

            await homeService.updateHomeSection(id, updates);

            // Silently update the cache with new data
            await refetch({ cancelRefetch: true });

        } catch (err) {
            console.error(`Error updating ${section} section:`, err);
            setError(err instanceof Error ? err.message : 'Failed to update section');
            throw err;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        data,
        isLoading: isInitialLoading,  // Only true on first load
        isSaving: isUpdating,         // True when updating
        error,
        handleImageUpdate,
        handleSectionUpdate,
    };
}; 