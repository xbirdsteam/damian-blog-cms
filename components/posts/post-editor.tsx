/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { LoadingImage } from "@/components/ui/loading-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/use-categories";
import { usePosts } from "@/hooks/use-posts";
import { slugify } from "@/lib/utils";
import { Post } from "@/services/post-service";
import { uploadService } from "@/services/upload-service";
import { Section, SectionType } from "@/types/editor";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Send,
  X,
} from "lucide-react";
import { nanoid } from "nanoid";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  BlockquoteSection,
  ImageSection,
  TableSection,
  TestimonialSection,
  TextSection,
} from "./sections";
import { ListSection } from "./sections/list-section";
import { PostAuthorSection } from "./sections/post-author-section";
import { SortableSections } from "./sections/sortable-sections";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  selectedCategories: z
    .array(z.string())
    .min(1, "At least one category is required"),
  postImg: z.string().nullable().optional(),
  sections: z.array(z.any()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PostEditorProps {
  initialData?: Post | null;
  mode: "create" | "edit";
  post_created_at?: string;
}

// Update PostStatus type to match CreatePostOptions
type PostStatus = "draft" | "published";

export function PostEditor({ initialData, mode }: PostEditorProps) {
  const { categories } = useCategories();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { createPost, updatePost, isCreating, isUpdating } = usePosts();
  const [isPublishing, setIsPublishing] = useState(false);

  // Initialize sections from initialData if available
  const [sections, setSections] = useState<Section[]>(() => {
    if (initialData?.content) {
      try {
        // Handle content from Supabase which is always a string
        const parsedContent = JSON.parse(initialData.content as string);
        if (Array.isArray(parsedContent)) {
          return parsedContent;
        }
      } catch (error) {
        console.error("Error parsing content:", error);
      }
    }
    return [];
  });

  const [selectedCategories, setSelectedCategories] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >(
    initialData?.posts_categories?.map((pc) => ({
      id: pc.categories.id,
      name: pc.categories.name,
    })) || []
  );

  // Initialize form with initial data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      shortDescription: initialData?.short_description || "",
      selectedCategories:
        initialData?.posts_categories?.map((pc) => pc.categories.id) || [],
      postImg: initialData?.post_img || "",
    },
  });

  // Update form and sections when initialData changes
  useEffect(() => {
    if (initialData) {
      // Update form values
      form.reset({
        title: initialData.title,
        slug: initialData.slug,
        shortDescription: initialData.short_description || "",
        selectedCategories:
          initialData?.posts_categories?.map((pc) => pc.categories.id) || [],
        postImg: initialData.post_img || "",
      });

      // Update sections
      if (initialData.content) {
        try {
          const parsedContent = JSON.parse(initialData.content as string);
          if (Array.isArray(parsedContent)) {
            setSections(parsedContent);
          }
        } catch (error) {
          console.error("Error parsing content:", error);
        }
      }
    }
  }, [initialData, form]);

  const isSaving = isCreating || isUpdating;

  // Watch title changes and update slug
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Update slug when title changes
      if (name === "title") {
        const newSlug = slugify(value.title || "");
        form.setValue("slug", newSlug, { shouldDirty: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: FormValues, isDraft: boolean = true) => {
    try {
      setIsPublishing(!isDraft);

      // Explicitly type the status
      const status: PostStatus = isDraft ? "draft" : "published";

      const postData = {
        title: values.title,
        slug: values.slug,
        short_description: values.shortDescription,
        post_img: values.postImg || "",
        status, // Use the typed status
        categoryIds: values.selectedCategories,
        content: sections,
        publish_date: isDraft ? null : new Date(),
      };

      if (mode === "edit" && initialData?.id) {
        await updatePost({
          id: initialData.id,
          ...postData,
        } as const); // Use const assertion to preserve literal types
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

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);

      // Upload image and get URL
      const url = await uploadService.uploadImage(file);

      // Update form with the new image URL
      form.setValue("postImg", url, { shouldDirty: true });

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddSection = (type: SectionType) => {
    let newSection: Section;

    switch (type) {
      case "text":
        newSection = {
          id: nanoid(),
          type: "text",
          title: "",
          paragraphs: [""],
        };
        break;

      case "table":
        newSection = {
          id: nanoid(),
          type: "table",
          title: "",
          columns: [
            { header: "Ingredients", key: "column1" },
            { header: "Instructions", key: "column2" },
          ],
          rows: [
            {
              column1: {
                type: "list",
                lists: [],
              },
              column2: {
                type: "list",
                lists: [],
              },
            },
          ],
        };
        break;

      case "blockquote":
        newSection = {
          id: nanoid(),
          type: "blockquote",
          content: "",
          author: "",
        };
        break;

      case "testimonial":
        newSection = {
          id: nanoid(),
          type: "testimonial",
          content: "",
          author: "",
        };
        break;

      case "image":
        newSection = {
          id: nanoid(),
          type: "image",
          urls: [],
        };
        break;

      case "list":
        newSection = {
          id: nanoid(),
          type: "list",
          title: "",
          lists: [{ title: "", items: [""] }],
        };
        break;

      case "post-author":
        newSection = {
          id: nanoid(),
          type: "post-author",
          author_name: "",
          avatar_url: null,
        };
        break;

      default:
        throw new Error(`Unsupported section type: ${type}`);
    }

    setSections((prev) => [...prev, newSection]);
  };

  const handleUpdateSection = (id: string, updates: Partial<Section>) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== id) return section;

        const updatedSection = { ...section, ...updates };

        // Ensure all required properties are present based on type
        switch (updatedSection.type) {
          case "text":
            return {
              id: updatedSection.id,
              type: "text",
              title: updatedSection.title || "",
              paragraphs: updatedSection.paragraphs || [""],
            };

          case "table":
            return {
              id: updatedSection.id,
              type: "table",
              title: updatedSection.title || "",
              columns: updatedSection.columns || [
                { header: "Ingredients", key: "column1" },
                { header: "Instructions", key: "column2" },
              ],
              rows: updatedSection.rows || [
                {
                  column1: {
                    type: "list",
                    lists: [],
                  },
                  column2: {
                    type: "list",
                    lists: [],
                  },
                },
              ],
            };

          case "blockquote":
            return {
              id: updatedSection.id,
              type: "blockquote",
              content: updatedSection.content || "",
              author: updatedSection.author || "",
            };

          case "testimonial":
            return {
              id: updatedSection.id,
              type: "testimonial",
              content: updatedSection.content || "",
              author: updatedSection.author || "",
            };

          case "image":
            return {
              id: updatedSection.id,
              type: "image",
              urls: updatedSection.urls || [],
            };

          case "list":
            return {
              id: updatedSection.id,
              type: "list",
              title: updatedSection.title || "",
              lists: updatedSection.lists || [{ title: "", items: [""] }],
            };

          case "post-author":
            return {
              id: updatedSection.id,
              type: "post-author",
              author_name: updatedSection.author_name || "",
              avatar_url: updatedSection.avatar_url || null,
            };

          default:
            return section;
        }
      })
    );
  };

  const handleDeleteSection = (id: string) => {
    setSections((prev) => prev.filter((section) => section.id !== id));
  };

  // Define section types array
  const sectionTypes = [
    { type: "text", label: "Text" },
    { type: "table", label: "Table" },
    { type: "blockquote", label: "Blockquote" },
    { type: "testimonial", label: "Testimonial" },
    { type: "image", label: "Image" },
    { type: "list", label: "List" },
    { type: "post-author", label: "Post Author" },
  ] as const;

  // Add category handler
  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    // Check if category is already selected
    if (!selectedCategories.some((sc) => sc.id === categoryId)) {
      const newCategories = [
        ...selectedCategories,
        { id: categoryId, name: category.name },
      ];
      setSelectedCategories(newCategories);
      form.setValue(
        "selectedCategories",
        newCategories.map((c) => c.id),
        { shouldDirty: true }
      );
    }
  };

  // Remove category handler
  const handleRemoveCategory = (categoryId: string) => {
    const newCategories = selectedCategories.filter((c) => c.id !== categoryId);
    setSelectedCategories(newCategories);
    form.setValue(
      "selectedCategories",
      newCategories.map((c) => c.id),
      { shouldDirty: true }
    );
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => onSubmit(data, true))}>
          <div className="mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">
              {mode === "create" ? "Create Post" : "Edit Post"}
            </h1>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/cms/posts">
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Posts
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="submit" variant="outline" disabled={isSaving}>
                    {isSaving && !isPublishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    disabled={isSaving}
                    onClick={() =>
                      form.handleSubmit((data) => onSubmit(data, false))()
                    }
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Publish
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-8">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter post title"
                              {...field}
                              className="text-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="post-url-slug"
                              {...field}
                              readOnly
                              className="bg-muted cursor-not-allowed"
                            />
                          </FormControl>
                          <FormDescription>
                            Auto-generated from title
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shortDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description of the post"
                              className="resize-none h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="selectedCategories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categories</FormLabel>
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {selectedCategories.map((category) => (
                                <div
                                  key={category.id}
                                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                                >
                                  <span className="text-sm">
                                    {category.name}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() =>
                                      handleRemoveCategory(category.id)
                                    }
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>

                            <Select onValueChange={handleCategorySelect}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Add a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories
                                  .filter(
                                    (category) =>
                                      !selectedCategories.some(
                                        (sc) => sc.id === category.id
                                      )
                                  )
                                  .map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postImg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Image</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              {field.value && (
                                <div className="relative w-[400px] h-[400px] overflow-hidden rounded-lg border">
                                  <LoadingImage
                                    src={field.value}
                                    alt="Featured"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex items-center gap-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={isUploadingImage}
                                  onClick={() => {
                                    const input =
                                      document.createElement("input");
                                    input.type = "file";
                                    input.accept = "image/*";
                                    input.onchange = (e) => {
                                      const file = (
                                        e.target as HTMLInputElement
                                      ).files?.[0];
                                      if (file) handleImageUpload(file);
                                    };
                                    input.click();
                                  }}
                                >
                                  {isUploadingImage ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                  )}
                                  {field.value ? "Change Image" : "Add Image"}
                                </Button>
                                {field.value && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      form.setValue("postImg", "", {
                                        shouldDirty: true,
                                      })
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {sections.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <SortableSections
                      sections={sections}
                      onSectionsChange={setSections}
                    >
                      {(section) => {
                        switch (section.type) {
                          case "text":
                            return (
                              <TextSection
                                section={section}
                                onUpdate={handleUpdateSection}
                                onDelete={handleDeleteSection}
                              />
                            );
                          case "table":
                            return (
                              <TableSection
                                section={section}
                                onUpdate={handleUpdateSection}
                                onDelete={handleDeleteSection}
                              />
                            );
                          case "blockquote":
                            return (
                              <BlockquoteSection
                                section={section}
                                onUpdate={handleUpdateSection}
                                onDelete={handleDeleteSection}
                              />
                            );
                          case "testimonial":
                            return (
                              <TestimonialSection
                                section={section}
                                onUpdate={handleUpdateSection}
                                onDelete={handleDeleteSection}
                              />
                            );
                          case "image":
                            return (
                              <ImageSection
                                section={section}
                                onUpdate={handleUpdateSection}
                                onDelete={handleDeleteSection}
                              />
                            );
                          case "list":
                            return (
                              <ListSection
                                section={section}
                                onUpdate={handleUpdateSection}
                                onDelete={handleDeleteSection}
                              />
                            );
                          case "post-author":
                            return (
                              <PostAuthorSection
                                key={section.id}
                                section={section}
                                onUpdate={handleUpdateSection}
                                onDelete={handleDeleteSection}
                              />
                            );
                          default:
                            return null;
                        }
                      }}
                    </SortableSections>
                  </CardContent>
                </Card>
              )}

              <div className="fixed bottom-6 right-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      className="h-12 w-12 rounded-full shadow-lg"
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    {sectionTypes.map(({ type, label }) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => handleAddSection(type as SectionType)}
                        className="cursor-pointer"
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
