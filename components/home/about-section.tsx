/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingImage } from "@/components/ui/loading-image";
import { Textarea } from "@/components/ui/textarea";
import { useHomeSettings } from "@/hooks/use-home-settings";
import { uploadImage } from "@/services";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { FormValues } from "./types";

interface AboutSectionProps {
  form: UseFormReturn<FormValues>;
}

export function AboutSection({ form }: AboutSectionProps) {
  const { data, isSaving, handleSectionUpdate } = useHomeSettings();
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [aboutImagePreview, setAboutImagePreview] = useState<string>("");
  const [updatingSection, setUpdatingSection] = useState<boolean>(false);

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

  const handleAboutUpdate = async () => {
    if (!data?.id) return;

    try {
      setUpdatingSection(true);

      let imageUrl = form.getValues("about.image_url");

      if (aboutImageFile) {
        imageUrl = await uploadImage(aboutImageFile, "home/about");

        if (aboutImagePreview) {
          URL.revokeObjectURL(aboutImagePreview);
        }
        setAboutImagePreview(imageUrl);
        setAboutImageFile(null);
      }

      const aboutData = form.getValues("about");
      await handleSectionUpdate(data.id, "about", {
        about_title: aboutData.title,
        about_description: aboutData.description,
        about_img_url: imageUrl,
        about_more_url: aboutData.button_url,
        about_bio: aboutData.about_bio,
      });

      form.reset(form.getValues());
      toast.success("About section updated successfully");
    } catch (error) {
      console.error("Failed to update About section:", error);
      toast.error("Failed to update About section");
    } finally {
      setUpdatingSection(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>About Me Section</CardTitle>
          <CardDescription>
            Configure your homepage about section
          </CardDescription>
        </div>
        <Button
          type="button"
          onClick={handleAboutUpdate}
          disabled={isSaving || updatingSection}
        >
          {updatingSection ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Section"
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="about.image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {(aboutImagePreview || field.value) && (
                    <div className="relative aspect-square w-48 overflow-hidden rounded-lg border">
                      <img src={aboutImagePreview || field.value} alt="" />
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
                      disabled={isSaving}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {field.value ? "Change Image" : "Choose Image"}
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
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="about.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter section title"
                  {...field}
                  disabled={isSaving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="about.about_bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your bio"
                  {...field}
                  disabled={isSaving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="about.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter brief description"
                  {...field}
                  disabled={isSaving}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="about.button_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>More Info Button URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter URL for more info button"
                  {...field}
                  disabled={isSaving}
                />
              </FormControl>
              <FormDescription>
                The URL where the &quot;More Info&quot; button will link to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
