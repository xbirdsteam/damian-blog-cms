import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingImage } from "@/components/ui/loading-image";
import { ImageSection as ImageSectionType } from "@/types/editor";
import { ImageIcon, Loader2, Plus, Trash, X } from "lucide-react";
import { BaseSection } from "./base-section";
import { useState } from "react";
import { uploadService } from "@/services/upload-service";
import { toast } from "sonner";

interface ImageSectionProps {
  section: ImageSectionType;
  onUpdate: (id: string, updates: Partial<ImageSectionType>) => void;
  onDelete: (id: string) => void;
}

export function ImageSection({
  section,
  onUpdate,
  onDelete,
}: ImageSectionProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const url = await uploadService.uploadImage(file);
      const updatedUrls = [...(section.urls || []), url];
      onUpdate(section.id, { urls: updatedUrls });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedUrls = section.urls?.filter(
      (_, index) => index !== indexToRemove
    );
    onUpdate(section.id, { urls: updatedUrls });
  };

  return (
    <BaseSection section={section} title="Image Section" onDelete={onDelete}>
      <div className="space-y-6">
        {/* Image Grid */}
        {section.urls && section.urls.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {section.urls.map((url, index) => (
              <div key={url} className="group relative aspect-square">
                <div className="relative w-full h-full rounded-md overflow-hidden bg-muted">
                  <LoadingImage
                    src={url}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleImageUpload(file);
              };
              input.click();
            }}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4 mr-2" />
            )}
            Add Image
          </Button>
        </div>
      </div>
    </BaseSection>
  );
}
