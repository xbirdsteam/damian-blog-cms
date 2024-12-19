import { Category } from "@/components/posts/category-list";
import { categoryService } from "@/services/category-service";
import { useQuery } from "@tanstack/react-query";

export function useCategories() {
    const {
        data: categories = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["categories"],
        queryFn: categoryService.getCategories,
    });

    const createCategory = async (category: Omit<Category, "index" | "is_active">) => {
        await categoryService.addCategory(category.name);
        refetch();
    };

    const updateCategoryOrder = async (categories: Category[]) => {
        await categoryService.updateCategoryOrder(categories);
        refetch();
    };

    const deleteCategory = async (id: string) => {
        await categoryService.deleteCategory(id);
        refetch();
    };

    const toggleCategoryActive = async (id: string, isActive: boolean) => {
        await categoryService.toggleCategoryActive(id, isActive);
        refetch();
    };

    return {
        categories,
        isLoading,
        createCategory,
        updateCategoryOrder,
        deleteCategory,
        toggleCategoryActive,
    };
} 