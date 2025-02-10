/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { CategoryItem } from "./category-item";
import { toast } from "sonner";
import { categoryService } from "@/services/category-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface Category {
  id: string;
  name: string;
  index: number;
  is_active: boolean;
}

function CategorySkeleton() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border bg-card p-3"
          >
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
        tolerance: 1,
        delay: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    console.log("Drag start:", {
      id: active.id,
      currentIndex: categories.findIndex((cat) => cat.id === active.id),
      item: categories.find((cat) => cat.id === active.id),
    });
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    console.log("Drag over:", {
      activeId: active.id,
      overId: over?.id,
      activeIndex: categories.findIndex((cat) => cat.id === active.id),
      overIndex: categories.findIndex((cat) => cat.id === over?.id),
    });
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = categories.findIndex((item) => item.id === active.id);
      const newIndex = categories.findIndex((item) => item.id === over.id);

      const activeItem = categories[oldIndex];
      const overItem = categories[newIndex];

      console.log("Drag end - Items swapped:", {
        moved: {
          item: activeItem,
          from: oldIndex,
          to: newIndex,
        },
        replaced: {
          item: overItem,
          from: newIndex,
          to: oldIndex,
        },
      });

      // Update local state
      const newCategories = arrayMove([...categories], oldIndex, newIndex);
      setCategories(newCategories);

      try {
        await categoryService.updateCategoryOrder(newCategories);
      } catch (error) {
        console.error("Error updating categories:", error);
        // Revert local state on error
        setCategories(categories);
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    // Generate a temporary ID
    const tempId = crypto.randomUUID();

    // Create optimistic category
    const optimisticCategory: Category = {
      id: tempId,
      name: newCategory.trim(),
      index: categories.length,
      is_active: true,
    };

    // Optimistically update UI
    setCategories([...categories, optimisticCategory]);
    setNewCategory("");

    try {
      const newCategoryData = await categoryService.addCategory(newCategory);
      // Replace optimistic category with real data
      setCategories((categories) =>
        categories.map((cat) => (cat.id === tempId ? newCategoryData : cat))
      );
    } catch (error) {
      console.error("Error adding category:", error);
      // Remove optimistic category on error
      setCategories((categories) =>
        categories.filter((cat) => cat.id !== tempId)
      );
      toast.error("Failed to add category");
    }
  };

  const handleToggleActive = async (categoryId: string, isActive: boolean) => {
    // Optimistically update the UI
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, is_active: isActive } : cat
      )
    );

    try {
      await categoryService.toggleCategoryActive(categoryId, isActive);
    } catch (error) {
      console.error("Error updating category status:", error);
      toast.error("Failed to update category status");
      // Revert on error
      setCategories(
        categories.map((cat) =>
          cat.id === categoryId ? { ...cat, is_active: !isActive } : cat
        )
      );
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Add to deleting set
    setDeletingIds((prev) => new Set(prev).add(categoryId));

    // Optimistically update UI
    const previousCategories = [...categories];
    setCategories(categories.filter((c) => c.id !== categoryId));

    try {
      await categoryService.deleteCategory(categoryId);
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      // Revert on error
      setCategories(previousCategories);
      toast.error("Failed to delete category");
    } finally {
      // Remove from deleting set
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true); // Start loading
    try {
      await handleDeleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleting(false); // End loading
    }
  };

  if (isLoading) {
    return <CategorySkeleton />;
  }

  return (
    <>
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Enter category name..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext
            items={categories}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  onRemove={() => setCategoryToDelete(category)}
                  onToggleActive={(isActive) =>
                    handleToggleActive(category.id, isActive)
                  }
                  disabled={isLoading}
                  isDeleting={deletingIds.has(category.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Card>

      <Dialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
            <DialogDescription className="space-y-3 pt-3">
              <p>
                Are you sure you want to delete{" "}
                <span className="font-medium">{categoryToDelete?.name}</span>?
                This will:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Delete all data associated with this category</li>
                <li>Remove category from all posts</li>
                <li>This action cannot be undone</li>
              </ul>
              <div className="bg-muted/50 p-3 rounded-lg mt-4 border">
                <p className="text-sm font-medium">Recommendation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Instead of deleting, consider setting the category as
                  inactive. This will:
                </p>
                <ul className="list-disc pl-4 mt-2 text-sm text-muted-foreground space-y-1">
                  <li>Hide the category from public view</li>
                  <li>Preserve all associated data</li>
                  <li>Allow reactivation at any time</li>
                </ul>
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => {
                    if (categoryToDelete) {
                      handleToggleActive(categoryToDelete.id, false);
                      setCategoryToDelete(null);
                    }
                  }}
                >
                  Set as Inactive Instead
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setCategoryToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
