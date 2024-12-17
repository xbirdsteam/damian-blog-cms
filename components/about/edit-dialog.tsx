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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  onSave: (content: string) => Promise<void>;
  inputType?: "input" | "textarea";
}

export function EditDialog({
  open,
  onOpenChange,
  title,
  content,
  onSave,
  inputType = "textarea",
}: EditDialogProps) {
  const [value, setValue] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(value);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      inputType === "input" &&
      !isSaving
    ) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => !isSaving && onOpenChange(open)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
          <DialogDescription>
            Make changes to your {title.toLowerCase()}. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        {inputType === "textarea" ? (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-h-[200px]"
            spellCheck={false}
            disabled={isSaving}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
          />
        )}
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
