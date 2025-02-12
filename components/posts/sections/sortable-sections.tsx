import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Section } from "@/types/editor";
import { cn } from "@/lib/utils";
import { GripVertical, MoveUpRight } from "lucide-react";
import { useState } from "react";

interface SortableSectionProps {
  section: Section;
  children: React.ReactNode;
  isDragging?: boolean;
}

function SortableSection({
  section,
  children,
  isDragging,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isFullWidth = section.type === "table";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative h-full rounded-lg border bg-card",
        isDragging && "z-50 border-primary shadow-md",
        isFullWidth && "md:col-span-2"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-3 top-3 z-10",
          "flex h-8 w-8 items-center justify-center",
          "rounded-md bg-muted",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "cursor-grab active:cursor-grabbing"
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Section Type Badge */}
      <div className="absolute right-3 top-3 z-10">
        <div
          className={cn(
            "flex items-center gap-1 rounded-md px-2 py-0.5 text-xs",
            "bg-muted text-muted-foreground"
          )}
        >
          <MoveUpRight className="h-3 w-3" />
          {section.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{children}</div>
    </div>
  );
}

interface SortableSectionsProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  children: (section: Section) => React.ReactNode;
}

export function SortableSections({
  sections,
  onSectionsChange,
  children,
}: SortableSectionsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    document.body.classList.add("dragging");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    document.body.classList.remove("dragging");

    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      onSectionsChange(newSections);
    }
  };

  const activeSection = sections.find((s) => s.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sections} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {sections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              isDragging={activeId === section.id}
            >
              {children(section)}
            </SortableSection>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId && activeSection ? (
          <div
            className={cn(
              "w-full opacity-90",
              // Adjust overlay width based on section type
              activeSection.type === "table"
                ? "max-w-[calc(100%-3rem)]"
                : "max-w-[calc(50%-1.5rem)]"
            )}
          >
            {children(activeSection)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
