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
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";

interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentImage: string;
  onSave: (file: File) => Promise<void>;
}

export function ImageDialog({
  open,
  onOpenChange,
  currentImage,
  onSave,
}: ImageDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (selectedFile) {
      try {
        setIsSaving(true);
        await onSave(selectedFile);
        await new Promise((resolve) => setTimeout(resolve, 500));
        onOpenChange(false);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => !isSaving && onOpenChange(open)}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Image</DialogTitle>
          <DialogDescription>
            Choose a new profile image. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg border">
            <img
              src={preview || currentImage}
              alt="Profile Preview"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
              disabled={isSaving}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("image-upload")?.click()}
              disabled={isSaving}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Image
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={!selectedFile || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
