"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingImage } from "@/components/ui/loading-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useConsultancyContent } from "@/hooks/use-consultancy";
import {
  consultancyService,
  ContentBlock,
  ListItem,
} from "@/services/consultancy-service";
import { ImageIcon, Loader2, Plus, Save, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ConsultancyEditorSkeleton } from "./consultancy-editor-skeleton";

export function ConsultancyEditor() {
  const { content, isLoading, isSaving, saveContent } = useConsultancyContent();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state from content when it loads
  useEffect(() => {
    if (content && !initialized) {
      const parsedContent =
        typeof content.content === "string"
          ? JSON.parse(content.content)
          : content.content;

      setBlocks(parsedContent || []);
      setFeaturedImage(content.image || content.featured_image);
      setInitialized(true);
    }
  }, [content, initialized]);

  const addBlock = () => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      title: "",
      description: "",
      listType: "bullet",
      listItems: [],
    };

    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);

    // Save immediately to ensure we have a record
    saveContent({
      id: content?.id,
      image: featuredImage,
      content: newBlocks,
    });
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter((block) => block.id !== blockId));
  };

  const updateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    setBlocks(
      blocks.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  };

  const addListItem = (blockId: string) => {
    const newItem: ListItem = {
      id: Date.now().toString(),
      title: "",
      content: "",
    };

    setBlocks(
      blocks.map((block) =>
        block.id === blockId
          ? { ...block, listItems: [...block.listItems, newItem] }
          : block
      )
    );
  };

  const updateListItem = (
    blockId: string,
    itemId: string,
    updates: Partial<ListItem>
  ) => {
    setBlocks(
      blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              listItems: block.listItems.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            }
          : block
      )
    );
  };

  const removeListItem = (blockId: string, itemId: string) => {
    setBlocks(
      blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              listItems: block.listItems.filter((item) => item.id !== itemId),
            }
          : block
      )
    );
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { url } = await consultancyService.uploadImage(file);
      setFeaturedImage(url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = async () => {
    try {
      await consultancyService.deleteImage();
      setFeaturedImage(null);
      toast.success("Image removed successfully");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  const handleSave = async () => {
    try {
      await saveContent({
        id: content?.id,
        image: featuredImage,
        content: blocks,
      });
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save changes");
    }
  };

  if (isLoading) {
    return <ConsultancyEditorSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Featured Image Card */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Image</CardTitle>
          <CardDescription>
            Upload an image to be displayed at the top of your consultancy page.
            Recommended size: 1920x1080px
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-lg border-2 border-dashed p-4">
            {featuredImage ? (
              <div className="relative group">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <LoadingImage
                    src={featuredImage}
                    alt="Featured image"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleImageRemove}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="aspect-video flex flex-col items-center justify-center gap-4 bg-muted/50 rounded-lg cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-4 rounded-full bg-primary/10">
                  <ImageIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Click to upload image</p>
                  <p className="text-sm text-muted-foreground">
                    SVG, PNG, JPG or GIF (Max. 5MB)
                  </p>
                </div>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="featured-image-upload"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Blocks Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Content Blocks</CardTitle>
            <CardDescription>Add and manage content sections</CardDescription>
          </div>
          <Button onClick={addBlock} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Block
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {blocks.map((block, blockIndex) => (
            <Card
              key={block.id}
              className="relative border-dashed hover:border-border"
            >
              {/* Block Number Badge */}
              <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {blockIndex + 1}
              </div>

              <CardContent className="space-y-6 pt-6">
                {/* Block Header */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b">
                  <Input
                    placeholder="Block Title"
                    value={block.title}
                    onChange={(e) =>
                      updateBlock(block.id, { title: e.target.value })
                    }
                    className="text-lg font-medium"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBlock(block.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Block Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <Textarea
                    placeholder="Description after title..."
                    value={block.description}
                    onChange={(e) =>
                      updateBlock(block.id, { description: e.target.value })
                    }
                    className="min-h-[100px] resize-y"
                  />
                </div>

                {/* List Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Select
                        value={block.listType}
                        onValueChange={(value: "bullet" | "numbered") =>
                          updateBlock(block.id, { listType: value })
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="List Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bullet">Bullet List</SelectItem>
                          <SelectItem value="numbered">
                            Numbered List
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">
                        {block.listItems.length} items
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addListItem(block.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add List Item
                    </Button>
                  </div>

                  <div className="space-y-3 pl-4">
                    {block.listItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="group relative rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="absolute -left-6 top-4 text-sm font-medium text-muted-foreground">
                          {block.listType === "numbered"
                            ? `${index + 1}.`
                            : "•"}
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Item Title"
                              value={item.title}
                              onChange={(e) =>
                                updateListItem(block.id, item.id, {
                                  title: e.target.value,
                                })
                              }
                              className="font-medium"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeListItem(block.id, item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Item Content"
                            value={item.content}
                            onChange={(e) =>
                              updateListItem(block.id, item.id, {
                                content: e.target.value,
                              })
                            }
                            className="min-h-[80px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {blocks.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <div className="text-muted-foreground space-y-2">
                <p>No content blocks yet</p>
                <p className="text-sm">
                  Click &quot;Add Block&quot; to get started
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || blocks.length === 0}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
