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
import { Textarea } from "@/components/ui/textarea";
import { useHomeSettings } from "@/hooks/use-home-settings";
import { deleteFile, getPathFromUrl, uploadVideo } from "@/services";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { FormValues } from "./types";

interface RecipeSectionProps {
  form: UseFormReturn<FormValues>;
}

export function RecipeSection({ form }: RecipeSectionProps) {
  const { data, isSaving, handleSectionUpdate } = useHomeSettings();
  const [recipeVideoFile, setRecipeVideoFile] = useState<File | null>(null);
  const [recipeVideoPreview, setRecipeVideoPreview] = useState<string>("");
  const [updatingSection, setUpdatingSection] = useState<boolean>(false);

  const isRecipeFormDirty = () => {
    const dirtyFields = form.formState.dirtyFields;

    return !!(
      dirtyFields.recipes?.title ||
      dirtyFields.recipes?.heading ||
      dirtyFields.recipes?.description ||
      dirtyFields.recipes?.button_url ||
      recipeVideoFile
    );
  };

  const handleRecipeVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (recipeVideoPreview) {
      URL.revokeObjectURL(recipeVideoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setRecipeVideoPreview(previewUrl);
    setRecipeVideoFile(file);
  };

  const handleRecipeUpdate = async () => {
    if (!data?.id || !isRecipeFormDirty()) return;

    try {
      setUpdatingSection(true);

      let videoUrl = form.getValues("recipes.video_url");
      if (recipeVideoFile) {
        const uploadTasks: Promise<string | boolean>[] = [];
        if (videoUrl) {
          const path = getPathFromUrl(videoUrl, 'videos');
          if (path) {
            uploadTasks.push(deleteFile(path, 'videos'));
          }
        }

        uploadTasks.push(uploadVideo(recipeVideoFile, "home/recipes"));

        const results = await Promise.all(uploadTasks);
        
        videoUrl = results[results.length - 1] as string;

        if (recipeVideoPreview) {
          URL.revokeObjectURL(recipeVideoPreview);
        }
        setRecipeVideoPreview(videoUrl);
        setRecipeVideoFile(null);
      }

      const recipeData = form.getValues("recipes");
      await handleSectionUpdate(data.id, "recipes", {
        recipe_title: recipeData.title,
        recipe_heading: recipeData.heading,
        recipe_description: recipeData.description,
        recipe_video_url: videoUrl,
        recipe_more_url: recipeData.button_url,
      });

      form.reset(form.getValues());
      toast.success("Recipes section updated successfully");
    } catch (error) {
      console.error("Failed to update Recipes section:", error);
      toast.error("Failed to update Recipes section");
    } finally {
      setUpdatingSection(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Recipes Section</CardTitle>
          <CardDescription>
            Configure your homepage recipes section
          </CardDescription>
        </div>
        <Button
          type="button"
          onClick={handleRecipeUpdate}
          disabled={!isRecipeFormDirty() || isSaving || updatingSection}
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
          name="recipes.video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Video</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {(recipeVideoPreview || field.value) && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                      <video
                        src={recipeVideoPreview || field.value}
                        className="h-full w-full object-cover"
                        controls
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleRecipeVideoSelect}
                      className="hidden"
                      id="recipe-video-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("recipe-video-upload")?.click()
                      }
                      disabled={isSaving}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {field.value ? "Change Video" : "Choose Video"}
                    </Button>
                    {recipeVideoFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setRecipeVideoFile(null);
                          if (recipeVideoPreview) {
                            URL.revokeObjectURL(recipeVideoPreview);
                          }
                          setRecipeVideoPreview("");
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
          name="recipes.title"
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
          name="recipes.heading"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heading</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter recipe heading"
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
          name="recipes.description"
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
          name="recipes.button_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>More Recipes Button URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter URL for more recipes button"
                  {...field}
                  disabled={isSaving}
                />
              </FormControl>
              <FormDescription>
                The URL where the &quot;More Recipes&quot; button will link to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
