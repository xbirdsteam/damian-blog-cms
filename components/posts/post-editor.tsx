"use client";

import { SeoSettingsModal } from "@/components/common/seo-settings-modal";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/plate-ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingImage } from "@/components/ui/loading-image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/use-categories";
import { usePosts } from "@/hooks/use-posts";
import { cn } from "@/lib/utils";
import { CreatePostOptions, Post, postService } from "@/services/post-service";
import { uploadService } from "@/services/upload-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlateEditor } from "@udecode/plate-common/react";
import {
  ArrowLeft,
  Check,
  ChevronsUpDown,
  ImageIcon,
  Save,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { PlateEditor as PlateEditorComponent } from "../editor/plate-editor";
import { SettingsProvider } from "../editor/settings";
import { LoadingSpinner } from "../ui/loading-spinner";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  content: z.any().optional(),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  featuredImage: z.string().nullable().optional(),
  seo: z
    .object({
      title: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      keywords: z.string().nullable().optional(),
      og_image: z.string().nullable().optional(),
    })
    .nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface PostEditorProps {
  initialData?: Post | null;
  mode: "create" | "edit";
}

export function PostEditor({ initialData, mode }: PostEditorProps) {
  const { categories } = useCategories();
  const [isSavingSeo, setIsSavingSeo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const editorRef = useRef<PlateEditor | null>(null);
  const { createPost, updatePost, isCreating, isUpdating } = usePosts();
  const [isPublishing, setIsPublishing] = useState(false);
  const isSaving = (isCreating || isUpdating) && !isPublishing;

  // Transform posts_categories into categoryIds array
  const initialCategoryIds =
    initialData?.posts_categories?.map((pc) => pc.categories.id) || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      shortDescription: initialData?.short_description || "",
      content: initialData?.content || "",
      categoryIds: initialCategoryIds,
      featuredImage: initialData?.featured_image || null,
      seo: initialData?.seo || {
        title: "",
        description: "",
        keywords: "",
        og_image: "",
      },
    },
  });

  const handleSeoSubmit = async (values: {
    title: string;
    description: string;
    keywords: string;
  }) => {
    form.setValue("seo", values);
    setIsSavingSeo(true);
    // Update SEO in the database if editing an existing post
    if (initialData?.id) {
      await updatePost({ id: initialData.id, seo: values });
      toast.success("SEO updated successfully");
      setIsSavingSeo(false);
    }
  };

  const handleFeaturedImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      // Upload image to storage
      const url = await uploadService.uploadImage(file, "posts/featured");

      // Update form state
      form.setValue("featuredImage", url);

      // If we're editing an existing post, update it in the database
      if (initialData?.id) {
        await postService.updatePost(initialData.id, {
          featured_image: url,
        });
      }

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSeoImageUpload = async (file: File) => {
    try {
      const url = await uploadService.uploadImage(file, "posts/seo");
      return url;
    } catch (error) {
      console.error("Error uploading SEO image:", error);
      toast.error("Failed to upload SEO image");
      throw error;
    }
  };

  const onSubmit = async (values: FormValues, isDraft: boolean) => {
    try {
      const editorContent = editorRef.current?.children || [];
      const postData: CreatePostOptions = {
        categoryIds: values.categoryIds,
        status: isDraft ? "draft" : "published",
        content: editorContent,
        featured_image: values.featuredImage || "",
        seo: values.seo || null,
        short_description: values.shortDescription,
        title: values.title,
        slug: values.title,
      };

      if (!isDraft) {
        setIsPublishing(true);
      }

      if (mode === "edit" && initialData?.id) {
        await updatePost({ id: initialData.id, ...postData });
        toast.success(
          isDraft ? "Post updated successfully" : "Post published successfully"
        );
      } else {
        await createPost(postData);
        toast.success(
          isDraft ? "Post created successfully" : "Post published successfully"
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save post");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Form {...form}>
      <div className="mx-auto p-6 space-y-8">
        <div className="flex flex-col gap-4">
          <Link
            href="/cms/posts"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Link>
          <h1 className="text-2xl font-semibold">
            {mode === "create" ? "Create Post" : "Edit Post"}
          </h1>
        </div>

        <div className="flex justify-between items-center">
          <SeoSettingsModal
            defaultValues={{
              title: form.getValues("seo.title") || "",
              description: form.getValues("seo.description") || "",
              keywords: form.getValues("seo.keywords") || "",
              og_image: form.getValues("seo.og_image") || "",
            }}
            onSubmit={handleSeoSubmit}
            onImageUpload={handleSeoImageUpload}
            pageName="Post"
            isSaving={isSavingSeo}
            showOgImage={false}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={isSaving || isPublishing}
              onClick={form.handleSubmit((values) => onSubmit(values, true))}
            >
              {isSaving ? <LoadingSpinner /> : <Save className="size-4 mr-2" />}
              {isSaving ? "Saving" : "Save Draft"}
            </Button>
            <Button
              type="submit"
              form="post-form"
              disabled={isSaving || isPublishing}
              onClick={form.handleSubmit((values) => onSubmit(values, false))}
            >
              {isPublishing ? (
                <LoadingSpinner />
              ) : (
                <Send className="size-4 mr-2" />
              )}
              {isPublishing ? "Publishing" : "Publish"}
            </Button>
          </div>
        </div>

        <form
          id="post-form"
          onSubmit={form.handleSubmit((values) => onSubmit(values, false))}
          className="space-y-8"
        >
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your post title..."
                    className="text-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a brief description..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Categories */}
          <FormField
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {field.value?.length
                          ? `${field.value.length} selected`
                          : "Select categories"}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start">
                      <Command>
                        <CommandInput placeholder="Search categories..." />
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {categories.map((category) => (
                            <CommandItem
                              key={category.id}
                              onSelect={() => {
                                const values = field.value || [];
                                field.onChange(
                                  values.includes(category.id)
                                    ? values.filter((id) => id !== category.id)
                                    : [...values, category.id]
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value?.includes(category.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {category.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <div className="mt-2 flex flex-wrap gap-2">
                  {field.value?.map((categoryId) => {
                    const category = categories.find(
                      (c) => c.id === categoryId
                    );
                    return (
                      category && (
                        <Badge key={category.id} variant="secondary">
                          {category.name}
                        </Badge>
                      )
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Featured Image */}
          <FormField
            control={form.control}
            name="featuredImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {/* Image Preview */}
                    {field.value && (
                      <div className="relative w-[200px] aspect-video rounded-md overflow-hidden border">
                        <LoadingImage
                          src={field.value}
                          alt="Featured"
                          className="object-cover"
                          fill
                          sizes="200px"
                        />
                      </div>
                    )}
                    {/* Upload Controls */}
                    <div className="flex items-center gap-4">
                      {field.value ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isUploadingImage}
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                if (file) handleFeaturedImageUpload(file);
                              };
                              input.click();
                            }}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {isUploadingImage ? "Uploading..." : "Change Image"}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isUploadingImage}
                            onClick={() => {
                              field.onChange(null);
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isUploadingImage}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) handleFeaturedImageUpload(file);
                            };
                            input.click();
                          }}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {isUploadingImage ? "Uploading..." : "Add Image"}
                        </Button>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content Editor */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <Card>
                  <CardContent className="p-4">
                    <SettingsProvider>
                      <PlateEditorComponent
                        initialContent={field.value}
                        editorRef={editorRef}
                      />
                    </SettingsProvider>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </div>
    </Form>
  );
}
