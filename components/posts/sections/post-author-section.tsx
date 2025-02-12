import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingImage } from "@/components/ui/loading-image";
import { PostAuthorSection as PostAuthorSectionType } from "@/types/editor";
import { ImageIcon, Loader2, X } from "lucide-react";
import { BaseSection } from "./base-section";
import { useState } from "react";
import { uploadService } from "@/services/upload-service";
import { toast } from "sonner";

interface PostAuthorSectionProps {
  section: PostAuthorSectionType;
  onUpdate: (id: string, updates: Partial<PostAuthorSectionType>) => void;
  onDelete: (id: string) => void;
}

export function PostAuthorSection({
  section,
  onUpdate,
  onDelete,
}: PostAuthorSectionProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const url = await uploadService.uploadImage(file);
      onUpdate(section.id, { avatar_url: url });
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <BaseSection section={section} title="Post Author" onDelete={onDelete}>
      <div className="space-y-6">
        {/* Author Name */}
        <div className="space-y-2">
          <Label>Author Name</Label>
          <Input
            value={section.author_name || ""}
            onChange={(e) =>
              onUpdate(section.id, { author_name: e.target.value })
            }
            placeholder="Enter author name..."
          />
        </div>

        {/* Author Avatar */}
        <div className="space-y-2">
          <Label>Author Avatar</Label>
          <div className="flex items-start gap-4">
            {section.avatar_url ? (
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                  <LoadingImage
                    src={section.avatar_url}
                    alt="Author avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onUpdate(section.id, { avatar_url: null })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : null}

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
                  if (file) handleAvatarUpload(file);
                };
                input.click();
              }}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4 mr-2" />
              )}
              {section.avatar_url ? "Change Avatar" : "Upload Avatar"}
            </Button>
          </div>
        </div>
      </div>
    </BaseSection>
  );
}
