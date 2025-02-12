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
import { Textarea } from "@/components/ui/textarea";
import { TimelineItem } from "@/types/about";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface TimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: TimelineItem[];
  onSave: (items: TimelineItem[]) => Promise<void>;
}

export function TimelineDialog({
  open,
  onOpenChange,
  items: initialItems,
  onSave,
}: TimelineDialogProps) {
  const [items, setItems] = useState<TimelineItem[]>(initialItems);
  const [isSaving, setIsSaving] = useState(false);

  const addItem = () => {
    setItems([...items, { id: uuidv4(), year: "", title: "", content: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof TimelineItem,
    value: string
  ) => {
    setItems(
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(items);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving timeline:", error);
      toast.error("Failed to save timeline");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Timeline</DialogTitle>
          <DialogDescription>
            Add or remove timeline items to showcase your journey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Year"
                  value={item.year}
                  onChange={(e) => updateItem(index, "year", e.target.value)}
                  className="w-24"
                />
                <Input
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder="Content"
                value={item.content}
                onChange={(e) => updateItem(index, "content", e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Timeline Item
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
