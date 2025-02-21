/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useAboutData } from "@/hooks/use-about-data";
import { useSEO } from "@/hooks/use-seo";
import { deleteFile, getPathFromUrl, uploadImage } from "@/services";
import { LinkItem, TimelineItem } from "@/types/about";
import { Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { PostSEOConfigModal, SeoFormValues } from "../posts/seo-config-modal";
import { AboutEditorSkeleton } from "./about-editor-skeleton";
import { EditDialog } from "./edit-dialog";
import { TimelineDialog } from "./timeline-dialog";

export function AboutEditor() {
  const { data, isLoading, updateData, updateTimeline } = useAboutData();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [aboutImagePreview, setAboutImagePreview] = useState<string>("");
  const [updatingImage, setUpdatingImage] = useState<boolean>(false);

  // Add SEO hook
  const seoRefId = data?.id || uuidv4();
  // Get seoConfig from the hook
  const { seoConfig, updateSEO, isUpdating: isUpdatingSEO } = useSEO(seoRefId);

  const handleUpdateTitle = async (newTitle: string) => {
    await updateData({
      id: data?.id || uuidv4(),
      updates: { title: newTitle },
    });
  };

  const handleUpdateMission = async (newMission: string) => {
    await updateData({
      id: data?.id || uuidv4(),
      updates: { mission: newMission },
    });
  };

  const handleUpdateVision = async (newVision: string) => {
    await updateData({
      id: data?.id || uuidv4(),
      updates: { vision: newVision },
    });
  };

  const handleUpdateTimeline = async (newTimeline: TimelineItem[]) => {
    await updateTimeline({ id: data?.id || uuidv4(), timelines: newTimeline });
  };

  const handleAboutImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (aboutImagePreview) {
      URL.revokeObjectURL(aboutImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setAboutImagePreview(previewUrl);
    setAboutImageFile(file);
  };

  const handleImageUpdate = async () => {
    if (!aboutImageFile) return;

    try {
      setUpdatingImage(true);
      const currentImageUrl = data?.image_url;
      const uploadTasks: Promise<string | boolean>[] = [];

      if (currentImageUrl) {
        const path = getPathFromUrl(currentImageUrl, "images");
        if (path) {
          uploadTasks.push(deleteFile(path, "images"));
        }
      }

      uploadTasks.push(uploadImage(aboutImageFile, "about/profile"));

      const results = await Promise.all(uploadTasks);
      const imageUrl = results[results.length - 1] as string;

      await updateData({
        id: data?.id || uuidv4(),
        updates: { image_url: imageUrl },
      });

      if (aboutImagePreview) {
        URL.revokeObjectURL(aboutImagePreview);
      }
      setAboutImagePreview(imageUrl);
      setAboutImageFile(null);
      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to update profile image");
    } finally {
      setUpdatingImage(false);
    }
  };

  // Add SEO handlers
  const handleSeoSubmit = async (values: SeoFormValues) => {
    try {
      await updateSEO({
        meta_title: values.title,
        meta_description: values.description,
        meta_keywords: values.keywords,
        og_image: values.og_image,
        og_twitter_image: values.og_twitter_image,
        seo_ref_id: seoRefId,
        slug: "about",
      });
    } catch (error) {
      console.error("Failed to update SEO:", error);
      toast.error("Failed to update SEO settings");
    }
  };

  const handleSeoImageUpload = async (file: File) => {
    try {
      const currentImageUrl = seoConfig?.og_image;
      const uploadTasks: Promise<string | boolean>[] = [];

      if (currentImageUrl) {
        const path = getPathFromUrl(currentImageUrl, "images");
        if (path) {
          uploadTasks.push(deleteFile(path, "images"));
        }
      }

      uploadTasks.push(uploadImage(file, "about/seo/og-image"));
      const results = await Promise.all(uploadTasks);
      return results[results.length - 1] as string;
    } catch (error) {
      console.error("Error uploading SEO image:", error);
      toast.error("Failed to upload SEO image");
      throw error;
    }
  };

  const handleUpdateWhereIAm = async (newContent: string) => {
    await updateData({
      id: data?.id || uuidv4(),
      updates: { where_i_am: newContent },
    });
  };

  const handleUpdateLinks = async (newLinks: LinkItem[]) => {
    await updateData({
      id: data?.id || uuidv4(),
      updates: { links: newLinks },
    });
  };

  if (isLoading) {
    return <AboutEditorSkeleton />;
  }

  // Render mission content with proper fallback
  const renderMissionContent = () => {
    if (!data?.mission) {
      return (
        <p className="text-muted-foreground italic">
          Click edit to add your mission statement
        </p>
      );
    }
    return (
      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap">{data.mission}</p>
      </div>
    );
  };

  // Render vision content with proper fallback
  const renderVisionContent = () => {
    if (!data?.vision) {
      return (
        <p className="text-muted-foreground italic">
          Click edit to add your vision statement
        </p>
      );
    }
    return (
      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap">{data.vision}</p>
      </div>
    );
  };

  // Add render helper for Where I Am section
  const renderWhereIAmContent = () => {
    if (!data?.where_i_am) {
      return (
        <p className="text-muted-foreground italic">
          Click edit to add your current status
        </p>
      );
    }
    return (
      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap">{data.where_i_am}</p>
      </div>
    );
  };

  return (
    <div className="relative mx-auto space-y-12 px-2 sm:px-4 pb-12 md:space-y-24 md:pb-24">
      <div className="flex items-center border-b pb-4">
        <div className="flex items-center justify-end gap-4">
          <PostSEOConfigModal
            defaultValues={{
              title: seoConfig?.meta_title || "",
              description: seoConfig?.meta_description || "",
              keywords: seoConfig?.meta_keywords || "",
              og_image: seoConfig?.og_image || "",
              og_twitter_image: seoConfig?.og_twitter_image || "",
            }}
            onSubmit={handleSeoSubmit}
            onImageUpload={handleSeoImageUpload}
            isSaving={isUpdatingSEO}
          />
        </div>
      </div>

      {/* Title Section */}
      <section className="group relative flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <div className="w-auto md:w-16 md:text-center">
          <span className="text-sm font-medium text-muted-foreground">01</span>
        </div>
        <div className="flex-1 space-y-4 border-l-2 border-primary pl-3 sm:pl-4 md:pl-8">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Title
          </span>
          <p className="text-4xl md:text-6xl font-bold tracking-tight">
            {data?.title || "About Me"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingSection("title")}
          className="absolute right-0 top-0 opacity-100 md:relative md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </section>

      {/* Mission Section */}
      <section className="group relative flex flex-col gap-2 md:flex-row md:gap-4">
        <div className="w-auto md:w-16 md:text-center">
          <span className="text-sm font-medium text-muted-foreground">02</span>
        </div>
        <div className="flex-1 space-y-4 border-l-2 border-primary pl-3 sm:pl-4 md:pl-8">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            My Mission
          </span>
          {renderMissionContent()}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingSection("mission")}
          className="absolute right-0 top-0 opacity-100 md:relative md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </section>

      {/* Vision Section */}
      <section className="group relative flex flex-col gap-2 md:flex-row md:gap-4">
        <div className="w-auto md:w-16 md:text-center">
          <span className="text-sm font-medium text-muted-foreground">03</span>
        </div>
        <div className="flex-1 space-y-4 border-l-2 border-primary pl-3 sm:pl-4 md:pl-8">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            My Vision
          </span>
          {renderVisionContent()}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingSection("vision")}
          className="absolute right-0 top-0 opacity-100 md:relative md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </section>

      {/* Where I Am Now Section */}
      <section className="group relative flex flex-col gap-2 md:flex-row md:gap-4">
        <div className="w-auto md:w-16 md:text-center">
          <span className="text-sm font-medium text-muted-foreground">04</span>
        </div>
        <div className="flex-1 space-y-4 border-l-2 border-primary pl-3 sm:pl-4 md:pl-8">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Where I Am Now
          </span>
          {renderWhereIAmContent()}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingSection("where_i_am")}
          className="absolute right-0 top-0 opacity-100 md:relative md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </section>

      {/* Links Section */}
      <section className="group relative flex flex-col gap-2 md:flex-row md:gap-4">
        <div className="w-auto md:w-16 md:text-center">
          <span className="text-sm font-medium text-muted-foreground">05</span>
        </div>
        <div className="flex-1 space-y-4 border-l-2 border-primary pl-3 sm:pl-4 md:pl-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Links
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingSection("links")}
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {data?.links?.map((link) => (
              <div key={link.id} className="flex items-center gap-2">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {link.title}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profile Image - Now full width */}
      <section className="group relative">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground w-16 text-center">
            06
          </span>
          <div className="flex-1 space-y-4 border-l-2 border-primary pl-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Profile Image
              </span>
              <Button
                type="button"
                onClick={handleImageUpdate}
                disabled={!aboutImageFile || updatingImage}
              >
                {updatingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Image"
                )}
              </Button>
            </div>
            <div className="space-y-4">
              {(aboutImagePreview || data?.image_url) && (
                <div className="relative aspect-[3/4] w-48 overflow-hidden rounded-lg border">
                  <img
                    src={aboutImagePreview || data?.image_url || ""}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAboutImageSelect}
                  className="hidden"
                  id="about-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("about-image-upload")?.click()
                  }
                  disabled={updatingImage}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {data?.image_url ? "Change Image" : "Choose Image"}
                </Button>
                {aboutImageFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setAboutImageFile(null);
                      if (aboutImagePreview) {
                        URL.revokeObjectURL(aboutImagePreview);
                      }
                      setAboutImagePreview("");
                    }}
                    disabled={updatingImage}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline History - Now full width */}
      <section className="group relative">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground w-16 text-center">
            07
          </span>
          <div className="flex-1 space-y-4 border-l-2 border-primary pl-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Timeline
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingSection("timeline")}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-6">
              {data?.timelines?.map((item, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[21px] h-[9px] w-[9px] rounded-full border border-primary bg-background" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.year}</span>
                      <span className="font-semibold">{item.title}</span>
                    </div>
                    <p className="text-muted-foreground">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Edit Dialogs */}
      <EditDialog
        open={editingSection === "title"}
        onOpenChange={(open) => !open && setEditingSection(null)}
        title="Page Title"
        content={data?.title ?? ""}
        onSave={handleUpdateTitle}
        inputType="input"
      />
      <EditDialog
        open={editingSection === "mission"}
        onOpenChange={(open) => !open && setEditingSection(null)}
        title="My Mission"
        content={data?.mission ?? ""}
        onSave={handleUpdateMission}
      />
      <EditDialog
        open={editingSection === "vision"}
        onOpenChange={(open) => !open && setEditingSection(null)}
        title="My Vision"
        content={data?.vision ?? ""}
        onSave={handleUpdateVision}
      />
      <TimelineDialog
        open={editingSection === "timeline"}
        onOpenChange={(open) => !open && setEditingSection(null)}
        items={data?.timelines ?? []}
        onSave={handleUpdateTimeline}
      />
      <EditDialog
        open={editingSection === "where_i_am"}
        onOpenChange={(open) => !open && setEditingSection(null)}
        title="Where I Am Now"
        content={data?.where_i_am ?? ""}
        onSave={handleUpdateWhereIAm}
      />
      <LinksDialog
        open={editingSection === "links"}
        onOpenChange={(open) => !open && setEditingSection(null)}
        links={data?.links ?? []}
        onSave={handleUpdateLinks}
      />
    </div>
  );
}

// Add new LinksDialog component
interface LinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: LinkItem[];
  onSave: (links: LinkItem[]) => Promise<void>;
}

function LinksDialog({
  open,
  onOpenChange,
  links: initialLinks,
  onSave,
}: LinksDialogProps) {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);
  const [isSaving, setIsSaving] = useState(false);

  const addLink = () => {
    setLinks([...links, { id: uuidv4(), url: "", title: "" }]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const updateLink = (id: string, field: "url" | "title", value: string) => {
    setLinks(
      links.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(links);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving links:", error);
      toast.error("Failed to save links");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Links</DialogTitle>
          <DialogDescription>
            Add or remove links to share with your audience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-2">
              <Input
                placeholder="Title"
                value={link.title}
                onChange={(e) => updateLink(link.id, "title", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="URL"
                value={link.url}
                onChange={(e) => updateLink(link.id, "url", e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLink(link.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addLink}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Link
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
