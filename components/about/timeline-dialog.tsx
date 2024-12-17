"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

interface TimelineItem {
  year: string;
  content: string;
}

interface TimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: TimelineItem[];
  onSave: (items: TimelineItem[]) => Promise<void>;
}

export function TimelineDialog({
  open,
  onOpenChange,
  items,
  onSave,
}: TimelineDialogProps) {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(items);
  const [isSaving, setIsSaving] = useState(false);

  const addItem = () => {
    setTimelineItems([...timelineItems, { year: "", content: "" }]);
  };

  const removeItem = (index: number) => {
    setTimelineItems(timelineItems.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof TimelineItem,
    value: string
  ) => {
    setTimelineItems(
      timelineItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const sortedItems = [...timelineItems].sort(
        (a, b) => Number(a.year) - Number(b.year)
      );
      await onSave(sortedItems);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && !e.shiftKey && !isSaving) {
      e.preventDefault();
      if (index === timelineItems.length - 1) {
        handleSave();
      } else {
        const nextInput = document.querySelector(
          `[data-index="${index + 1}"]`
        ) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => !isSaving && onOpenChange(open)}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Timeline History</DialogTitle>
          <DialogDescription>
            Add, remove, or modify timeline entries. Items will be automatically
            sorted by year.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {timelineItems.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <Input
                data-index={index}
                placeholder="Year"
                value={item.year}
                onChange={(e) => updateItem(index, "year", e.target.value)}
                className="w-24"
                spellCheck={false}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={isSaving}
              />
              <Input
                data-index={index}
                placeholder="Description"
                value={item.content}
                onChange={(e) => updateItem(index, "content", e.target.value)}
                spellCheck={false}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={isSaving}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                className="shrink-0"
                disabled={isSaving}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={addItem}
            disabled={isSaving}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Timeline Item
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
