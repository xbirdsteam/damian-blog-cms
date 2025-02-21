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
import {
  Label,
} from "@/components/ui/label";
import { LoadingImage } from "@/components/ui/loading-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/use-categories";
import { usePosts } from "@/hooks/use-posts";
import { useSEO } from "@/hooks/use-seo";
import { Post, postService } from "@/services/post-service";
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
import { SortableSections } from "./sections/sortable-sections";
import { PostSEOConfigModal, SeoFormValues } from "./seo-config-modal";
import { createClient } from "@/utils/supabase/client";

// Update form schema to match the actual post structure
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  short_description: z.string().min(1, "Short description is required"),
  post_img: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]),
  categoryIds: z.array(z.string()),
  content: z.any(), // This will store the sections
  seo_config: z.object({
    meta_title: z.string(),
    meta_description: z.string(),
    meta_keywords: z.string(),
    og_image: z.string().optional(),
    og_twitter_image: z.string().optional(),
  }).optional(),
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

  const [tags, setTags] = useState<string[]>(() => {
    // Initialize with existing tags if editing a post
    return initialData?.tags || [];
  });

  // Initialize form with correct structure
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      short_description: initialData?.short_description || "",
      post_img: initialData?.post_img || "",
      status: initialData?.status || "draft",
      categoryIds: initialData?.posts_categories?.map((pc) => pc.categories.id) || [],
      content: initialData?.content || "",
    },
  });

  // Update form and sections when initialData changes
  useEffect(() => {
    if (initialData) {
      // Update form values
      form.reset({
        title: initialData.title,
        slug: initialData.slug,
        short_description: initialData.short_description || "",
        post_img: initialData.post_img || "",
        status: initialData.status || "draft",
        categoryIds: initialData?.posts_categories?.map((pc) => pc.categories.id) || [],
        content: initialData.content || "",
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

  // Auto-generate slug when title changes
  useEffect(() => {
    const subscription = form.watch(async (value, { name }) => {
      if (name === "title") {
        const title = value.title;
        if (title) {
          const currentId = initialData?.id || null;
          const slug = await postService.generateUniqueSlug(title, currentId);
          form.setValue("slug", slug, { shouldDirty: true });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, initialData?.id]);

  const onSubmit = async (values: FormValues, isDraft: boolean = false) => {
    try {
      setIsPublishing(!isDraft);
      const status: PostStatus = isDraft ? "draft" : "published";

      if (mode === "edit" && initialData?.id) {
        // Update post - no need to get user
        await updatePost({
          id: initialData.id,
          title: values.title,
          slug: values.slug,
          short_description: values.short_description,
          post_img: values.post_img || "",
          content: sections,
          status,
          categoryIds: values.categoryIds,
          publish_date: isDraft ? null : new Date(),
          tags: tags,
        });
        toast.success(isDraft ? "Post updated successfully (Draft)" : "Post published successfully");
      } else {
        // Only get user for new post creation
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Not authenticated");
        }

        // Create new post with author_id
        const newPost = await createPost({
          title: values.title,
          slug: values.slug,
          short_description: values.short_description,
          post_img: values.post_img || "",
          content: sections,
          status,
          categoryIds: values.categoryIds,
          publish_date: isDraft ? null : new Date(),
          tags: tags,
          author_id: user.id,
        });

        // SEO config handling remains same
        if (values.seo_config) {
          await updateSEO({
            seo_ref_id: newPost.id,
            meta_title: values.seo_config.meta_title,
            meta_description: values.seo_config.meta_description,
            meta_keywords: values.seo_config.meta_keywords,
            og_image: values.seo_config.og_image,
            og_twitter_image: values.seo_config.og_twitter_image,
            slug: `${values.slug}`,
          });
        }

        toast.success(isDraft ? "Post created successfully (Draft)" : "Post published successfully");
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
      form.setValue("post_img", url, { shouldDirty: true });

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
        "categoryIds",
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
      "categoryIds",
      newCategories.map((c) => c.id),
      { shouldDirty: true }
    );
  };

  // Add SEO hook
  const {
    seoConfig,
    updateSEO,
    isUpdating: isUpdatingSEO
  } = useSEO(initialData?.id || "");

  const handleSEOSubmit = async (seoValues: SeoFormValues) => {
    try {
      if (mode === "create") {
        // Store SEO values temporarily until post is created
        form.setValue("seo_config", {
          meta_title: seoValues.title,
          meta_description: seoValues.description,
          meta_keywords: seoValues.keywords,
          og_image: seoValues.og_image,
          og_twitter_image: seoValues.og_twitter_image,
        });
        toast.success("SEO settings will be saved after you publish or save draft the post");
        return;
      }

      // For edit mode, update SEO directly
      const postSlug = form.getValues("slug");

      await updateSEO({
        seo_ref_id: initialData!.id,
        meta_title: seoValues.title,
        meta_description: seoValues.description,
        meta_keywords: seoValues.keywords,
        og_image: seoValues.og_image,
        og_twitter_image: seoValues.og_twitter_image,
        slug: `${postSlug}`,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update SEO settings");
    }
  };

  const handleSEOImageUpload = async (file: File, type: "default" | "twitter") => {
    try {
      const url = await uploadService.uploadImage(file);
      return url;
    } catch (error) {
      toast.error("Failed to upload image");
      throw error;
    }
  };

  return (
    <div>
      <div className="mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/posts">
              <Button variant="outline" size="sm" className="cursor-pointer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <PostSEOConfigModal
              defaultValues={{
                title: seoConfig?.meta_title || "",
                description: seoConfig?.meta_description || "",
                keywords: seoConfig?.meta_keywords || "",
                og_image: seoConfig?.og_image || "",
                og_twitter_image: seoConfig?.og_twitter_image || "",
              }}
              onSubmit={handleSEOSubmit}
              onImageUpload={handleSEOImageUpload}
              isSaving={isUpdatingSEO}
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">
          {mode === "create" ? "Create Post" : "Edit Post"}
        </h1>

        <Form {...form}>
          <form>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-end mb-4">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => form.handleSubmit((data) => onSubmit(data, true))()}
                        className="cursor-pointer"
                      >
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
                        onClick={() => form.handleSubmit((data) => onSubmit(data, false))()}
                        className="cursor-pointer"
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
                      name="short_description"
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
                      name="categoryIds"
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
                                    className="h-4 w-4 p-0 hover:bg-transparent cursor-pointer"
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
                      name="post_img"
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
                                  className="cursor-pointer"
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
                                      form.setValue("post_img", "", {
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

                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <TagInput
                        placeholder="Type a tag and press Enter..."
                        tags={tags}
                        setTags={setTags}
                        disabled={isSaving}
                      />
                      <FormDescription>
                        Type a tag and press Enter to add it to the list.
                      </FormDescription>
                    </div>
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
                      className="h-12 w-12 rounded-full shadow-lg cursor-pointer"
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
          </form>
        </Form>
      </div>
    </div>
  );
}
