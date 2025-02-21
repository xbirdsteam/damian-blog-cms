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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Settings, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const seoSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title should be less than 100 characters"),
  description: z.string()
    .min(1, "Description is required")
    .max(300, "Description should be less than 300 characters"),
  keywords: z.string().min(1, "Keywords are required"),
  og_image: z.string().optional(),
  og_twitter_image: z.string().optional(),
});

export type SeoFormValues = z.infer<typeof seoSchema>;

interface PostSEOConfigModalProps {
  defaultValues?: {
    title: string;
    description: string;
    keywords: string;
    og_image?: string;
    og_twitter_image?: string;
  };
  onSubmit: (values: SeoFormValues) => Promise<void>;
  onImageUpload: (file: File, type: "default" | "twitter") => Promise<string>;
  isSaving?: boolean;
  disabled?: boolean;
}

export function PostSEOConfigModal({
  defaultValues,
  onSubmit,
  onImageUpload,
  isSaving,
  disabled,
}: PostSEOConfigModalProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoSchema),
    defaultValues,
  });

  // Reset form with default values when modal opens
  useEffect(() => {
    if (open && defaultValues) {
      form.reset({
        title: defaultValues.title,
        description: defaultValues.description,
        keywords: defaultValues.keywords,
        og_image: defaultValues.og_image,
        og_twitter_image: defaultValues.og_twitter_image,
      });
    }
  }, [open, defaultValues, form]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [twitterImageFile, setTwitterImageFile] = useState<File | null>(null);
  const [twitterImagePreview, setTwitterImagePreview] = useState<string>("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
    // Mark the form as dirty when image is selected
    form.setValue("og_image", previewUrl, { shouldDirty: true });
  };

  const handleTwitterImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (twitterImagePreview) {
      URL.revokeObjectURL(twitterImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setTwitterImagePreview(previewUrl);
    setTwitterImageFile(file);
    // Mark the form as dirty when twitter image is selected
    form.setValue("og_twitter_image", previewUrl, { shouldDirty: true });
  };

  const handleSubmit = async (values: SeoFormValues) => {
    try {
      setIsUploadingImages(true); // Start loading when uploading images
      let ogImage = values.og_image;
      let ogTwitterImage = values.og_twitter_image;

      if (imageFile) {
        ogImage = await onImageUpload(imageFile, "default");
      }
      if (twitterImageFile) {
        ogTwitterImage = await onImageUpload(twitterImageFile, "twitter");
      }

      await onSubmit({
        ...values,
        og_image: ogImage,
        og_twitter_image: ogTwitterImage,
      });

      // Cleanup previews
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (twitterImagePreview) URL.revokeObjectURL(twitterImagePreview);
      setImagePreview("");
      setImageFile(null);
      setTwitterImagePreview("");
      setTwitterImageFile(null);
    } catch (error) {
      console.error("Error in SEO submit:", error);
    } finally {
      setIsUploadingImages(false); // End loading after upload completes or fails
    }
  };

  const titleLength = form.watch("title").length;
  const descriptionLength = form.watch("description").length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Settings className="mr-2 h-4 w-4" />
          SEO Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>SEO Settings</DialogTitle>
          <DialogDescription>
            Configure SEO settings for better visibility in search engines and social media.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSaving} />
                  </FormControl>
                  <FormDescription className={cn(
                    titleLength > 0 && titleLength < 50 && "text-yellow-500",
                    titleLength >= 50 && titleLength <= 60 && "text-green-500",
                    titleLength > 60 && "text-red-500"
                  )}>
                    {titleLength}/60 characters (50-60 characters recommended)
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
                    <Textarea {...field} disabled={isSaving} />
                  </FormControl>
                  <FormDescription className={cn(
                    descriptionLength > 0 && descriptionLength < 150 && "text-yellow-500",
                    descriptionLength >= 150 && descriptionLength <= 160 && "text-green-500",
                    descriptionLength > 160 && "text-red-500"
                  )}>
                    {descriptionLength}/160 characters (150-160 characters recommended)
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
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSaving} />
                  </FormControl>
                  <FormDescription>
                    Separate keywords with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Default OG Image */}
            <FormField
              control={form.control}
              name="og_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {(imagePreview || field.value) && (
                        <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-lg border">
                          <img
                            src={imagePreview || field.value}
                            alt="OG Preview"
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
                            document.getElementById("og-image-upload")?.click()
                          }
                          disabled={isSaving}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {field.value ? "Change Image" : "Choose Image"}
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Recommended size: 1200x630 pixels. This image will be shown when your post is shared on social media.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Twitter OG Image */}
            <FormField
              control={form.control}
              name="og_twitter_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter Card Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {(twitterImagePreview || field.value) && (
                        <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-lg border">
                          <img
                            src={twitterImagePreview || field.value}
                            alt="Twitter Card Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleTwitterImageSelect}
                          className="hidden"
                          id="og-twitter-image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("og-twitter-image-upload")?.click()
                          }
                          disabled={isSaving}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {field.value ? "Change Image" : "Choose Image"}
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Recommended size: 1200x630 pixels. While Twitter supports various card sizes, using 1200x630 ensures consistency across all social platforms.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isSaving || isUploadingImages}
              >
                {(isSaving || isUploadingImages) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploadingImages ? "Uploading Images..." : "Saving Changes..."}
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