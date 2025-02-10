import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ConsultancyContent,
    ConsultancyData,
    FormStep,
    SuccessStep,
    consultancyService,
    ConsultancyStep,
} from "@/services/consultancy-service";
import { toast } from "sonner";

// Content Hook
export function useConsultancyContent() {
    const queryClient = useQueryClient();

    const { data: content, isLoading } = useQuery({
        queryKey: ["consultancy-content"],
        queryFn: () => consultancyService.getContent(),
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    const { mutateAsync: saveContent, isPending: isSaving } = useMutation({
        mutationFn: (data: ConsultancyData) => consultancyService.saveContent(data),
        onSuccess: (newData) => {
            queryClient.setQueryData(["consultancy-content"], newData);
            toast.success("Content saved successfully");
        },
        onError: () => {
            toast.error("Failed to save content");
        },
    });

    return {
        content,
        isLoading,
        isSaving,
        saveContent,
    };
}

// Form Steps Hook
export function useConsultancyForm() {
    const queryClient = useQueryClient();

    const { data: steps, isLoading } = useQuery({
        queryKey: ['consultancy-steps'],
        queryFn: () => consultancyService.getSteps(),
        // Use a fixed staleTime since we handle empty states in the service
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const { mutateAsync: updateStep } = useMutation({
        mutationFn: (params: { id: string; updates: Partial<ConsultancyStep> }) =>
            consultancyService.updateStep(params.id, params.updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consultancy-steps'] });
        },
    });

    return {
        steps,
        isLoading,
        updateStep,
    };
}

// Success Steps Hook
export function useConsultancySuccess() {
    const queryClient = useQueryClient();

    const {
        data: steps,
        isLoading,
        error,
    } = useQuery<SuccessStep[]>({
        queryKey: ["consultancy-success"],
        queryFn: () => consultancyService.getSuccessSteps(),
    });

    const { mutateAsync: updateSteps, isPending: isUpdating } = useMutation({
        mutationFn: (updates: SuccessStep[]) =>
            consultancyService.updateSuccessSteps(updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["consultancy-success"] });
        },
    });

    const { mutateAsync: deleteStep, isPending: isDeleting } = useMutation({
        mutationFn: (stepId: string) => consultancyService.deleteSuccessStep(stepId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["consultancy-success"] });
        },
    });

    return {
        steps,
        isLoading,
        isUpdating,
        isDeleting,
        error,
        updateSteps,
        deleteStep,
    };
} 