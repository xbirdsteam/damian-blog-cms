import { Category } from "@/components/posts/category-list";
import { createClient } from "@/utils/supabase/client";

export const categoryService = {
    async getCategories() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("index");
        if (error) throw error;
        return data as Category[];
    },

    async addCategory(name: string) {
        const supabase = createClient();
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        // Get the highest index
        const { data: maxIndexData } = await supabase
            .from("categories")
            .select("index")
            .order("index", { ascending: false })
            .limit(1);

        const nextIndex = (maxIndexData?.[0]?.index ?? -1) + 1;

        // Insert new category
        const { data, error } = await supabase
            .from("categories")
            .insert([
                {
                    id: crypto.randomUUID(),
                    name: name.trim(),
                    slug,
                    index: nextIndex,
                    is_active: true,
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateCategoryOrder(categories: Category[]) {
        const supabase = createClient();
        const { error } = await supabase.rpc("update_categories_order", {
            positions: categories.map((category, index) => ({
                id: category.id,
                new_index: index,
            })),
        });

        if (error) throw error;
    },

    async toggleCategoryActive(categoryId: string, isActive: boolean) {
        const supabase = createClient();
        const { error } = await supabase
            .from("categories")
            .update({ is_active: isActive })
            .eq("id", categoryId);

        if (error) throw error;
    },

    async deleteCategory(categoryId: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", categoryId);

        if (error) throw error;
    },
}; 