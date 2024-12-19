/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Settings, Upload } from "lucide-react";
import { useState, useEffect } from "react";

const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional().default([]),
  og_image: z.string(),
});

type SeoFormValues = z.infer<typeof seoSchema>;

interface SeoSettingsModalProps {
  defaultValues?: {
    title: string;
    description: string;
    keywords: string;
    og_image: string;
  };
  onSubmit: (values: {
    title: string;
    description: string;
    keywords: string;
    og_image: string;
  }) => Promise<void>;
  onImageUpload: (file: File) => Promise<string>;
  isSaving?: boolean;
  pageName: string;
  showOgImage?: boolean; // Added prop to control visibility of OG image upload
}

export function SeoSettingsModal({
  defaultValues,
  onSubmit,
  onImageUpload,
  isSaving,
  pageName,
  showOgImage, // Destructure the new prop
}: SeoSettingsModalProps) {
  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoSchema),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (defaultValues) {
      const keywordsArray = defaultValues.keywords
        ? defaultValues.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : [];

      form.reset({
        title: defaultValues.title || "",
        description: defaultValues.description || "",
        keywords: keywordsArray,
        og_image: defaultValues.og_image || "",
      });
    }
  }, [defaultValues, form]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);

    form.setValue("og_image", form.getValues("og_image") || "");
  };

  const handleSubmit = async (values: SeoFormValues) => {
    try {
      let ogImageUrl = values.og_image || "";

      if (imageFile) {
        ogImageUrl = await onImageUpload(imageFile);

        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview("");
        setImageFile(null);
      }

      await onSubmit({
        title: values.title || "",
        description: values.description || "",
        keywords: values.keywords?.length ? values.keywords.join(", ") : "",
        og_image: ogImageUrl || "",
      });
    } catch (error) {
      console.error("Error in SEO settings submit:", error);
      throw error;
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          SEO Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col overflow-y-auto custom-scroll">
        <DialogHeader>
          <DialogTitle>{pageName} SEO Settings</DialogTitle>
          <DialogDescription>
            Configure SEO settings for better search engine visibility
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4 pr-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter meta title"
                      {...field}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormDescription>
                    The title that appears in search engine results
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter meta description"
                      {...field}
                      disabled={isSaving}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of the page that appears in search
                    results
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Keywords</FormLabel>
                  <FormControl>
                    <TagInput
                      placeholder="Type a keyword and press Enter..."
                      tags={field.value}
                      setTags={(newTags) => field.onChange(newTags)}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormDescription>
                    Type a keyword and press Enter to add it. Each keyword helps
                    search engines understand your content.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showOgImage && ( // Conditional rendering based on showOgImage prop
              <FormField
                control={form.control}
                name="og_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OG Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {(imagePreview || field.value) && (
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                            <img
                              src={imagePreview || field.value}
                              alt="OG Image Preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="og-image-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document
                                .getElementById("og-image-upload")
                                ?.click()
                            }
                            disabled={isSaving}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {field.value || imagePreview
                              ? "Change Image"
                              : "Choose Image"}
                          </Button>
                          {imagePreview && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                if (imagePreview) {
                                  URL.revokeObjectURL(imagePreview);
                                }
                                setImagePreview("");
                                setImageFile(null);
                              }}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Recommended size: 1200x630 pixels
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end pt-4 border-t mt-4">
              <Button
                type="submit"
                disabled={!form.formState.isDirty || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save SEO Settings"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
