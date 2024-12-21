"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Loader2, Trash2 } from "lucide-react";
import { Category } from "./category-list";

interface CategoryItemProps {
  category: Category;
  onRemove: () => void;
  onToggleActive: (isActive: boolean) => void;
  disabled?: boolean;
  isDeleting?: boolean;
}

export function CategoryItem({
  category,
  onRemove,
  onToggleActive,
  disabled,
  isDeleting,
}: CategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-md border bg-card p-3 select-none cursor-grab active:cursor-grabbing",
        isDragging
          ? "border-primary/50 bg-accent shadow-sm z-10"
          : "hover:border-primary/20 hover:bg-accent/50 hover:shadow-sm",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <GripVertical
        className={cn(
          "h-4 w-4 transition-colors",
          isDragging
            ? "text-primary"
            : "text-muted-foreground group-hover:text-primary/70"
        )}
      />

      <span className="flex-1 truncate font-medium">{category.name}</span>

      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Switch
          checked={category.is_active}
          onCheckedChange={onToggleActive}
          disabled={disabled}
        />

        <Button
          variant="ghost"
          size="icon"
          disabled={disabled || isDeleting}
          onClick={onRemove}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
