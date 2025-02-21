/* eslint-disable @next/next/no-img-element */
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { deleteFile, getPathFromUrl, uploadImage } from "@/services";
import { UpdateLayoutOptions } from "@/services/settings-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";

const formSchema = z.object({
  social_links: z.object({
    instagram: z.string().url().optional().or(z.literal("")),
    youtube: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
    pinterest: z.string().url().optional().or(z.literal("")),
    tiktok: z.string().url().optional().or(z.literal("")),
  }),
});

type FormValues = z.infer<typeof formSchema>;

type SocialPlatform = keyof FormValues["social_links"];

interface IProps {
  id: string;
}

export function LayoutSettings({ id }: IProps) {
  const { data, updateLayout, isSavingLayout } = useSettings();
  // Initialize with data if available
  const [headerLogo, setHeaderLogo] = useState<string | null>(null);
  const [footerLogo, setFooterLogo] = useState<string | null>(null);

  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [headerImagePreview, setHeaderImagePreview] = useState<string>("");
  const [footerImageFile, setFooterImageFile] = useState<File | null>(null);
  const [footerImagePreview, setFooterImagePreview] = useState<string>("");
  const [updatingHeaderImage, setUpdatingHeaderImage] = useState(false);
  const [updatingFooterImage, setUpdatingFooterImage] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      social_links: {
        instagram: "",
        youtube: "",
        linkedin: "",
        pinterest: "",
        tiktok: "",
      },
    },
  });

  // Update state when data changes
  useEffect(() => {
    if (data) {
      // Reset form
      form.reset({
        social_links: {
          instagram: data.social_links?.instagram || "",
          youtube: data.social_links?.youtube || "",
          linkedin: data.social_links?.linkedin || "",
          pinterest: data.social_links?.pinterest || "",
          tiktok: data.social_links?.tiktok || "",
        },
      });

      // Update logo states
      if (data.header_logo) {
        setHeaderLogo(data.header_logo);
      }
      if (data.footer_logo) {
        setFooterLogo(data.footer_logo);
      }
    }
  }, [data, form]);

  const onSubmit = async (values: FormValues) => {
    const updateOptions: UpdateLayoutOptions = {
      id: id || uuidv4(),
      settings: values,
      header_logo: headerLogo,
      footer_logo: footerLogo,
    };
    await updateLayout(updateOptions);
  };

  const handleHeaderImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (headerImagePreview) {
      URL.revokeObjectURL(headerImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setHeaderImagePreview(previewUrl);
    setHeaderImageFile(file);
  };

  const handleFooterImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (footerImagePreview) {
      URL.revokeObjectURL(footerImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setFooterImagePreview(previewUrl);
    setFooterImageFile(file);
  };

  const handleHeaderImageUpdate = async () => {
    if (!headerImageFile) return;

    try {
      setUpdatingHeaderImage(true);
      const currentImageUrl = data?.header_logo;
      const uploadTasks: Promise<string | boolean>[] = [];

      if (currentImageUrl) {
        const path = getPathFromUrl(currentImageUrl, "images");
        if (path) {
          uploadTasks.push(deleteFile(path, "images"));
        }
      }

      uploadTasks.push(uploadImage(headerImageFile, "layout/header-logo"));

      const results = await Promise.all(uploadTasks);
      const imageUrl = results[results.length - 1] as string;

      await updateLayout({
        id: id || uuidv4(),
        header_logo: imageUrl,
      });

      if (headerImagePreview) {
        URL.revokeObjectURL(headerImagePreview);
      }
      setHeaderImagePreview(imageUrl);
      setHeaderImageFile(null);
      toast.success("Header logo updated successfully");
    } catch (error) {
      console.error("Error uploading header logo:", error);
      toast.error("Failed to update header logo");
    } finally {
      setUpdatingHeaderImage(false);
    }
  };

  const handleFooterImageUpdate = async () => {
    if (!footerImageFile) return;

    try {
      setUpdatingFooterImage(true);
      const currentImageUrl = data?.footer_logo;
      const uploadTasks: Promise<string | boolean>[] = [];

      if (currentImageUrl) {
        const path = getPathFromUrl(currentImageUrl, "images");
        if (path) {
          uploadTasks.push(deleteFile(path, "images"));
        }
      }

      uploadTasks.push(uploadImage(footerImageFile, "layout/footer-logo"));

      const results = await Promise.all(uploadTasks);
      const imageUrl = results[results.length - 1] as string;

      await updateLayout({
        id: id || uuidv4(),
        footer_logo: imageUrl,
      });

      if (footerImagePreview) {
        URL.revokeObjectURL(footerImagePreview);
      }
      setFooterImagePreview(imageUrl);
      setFooterImageFile(null);
      toast.success("Footer logo updated successfully");
    } catch (error) {
      console.error("Error uploading footer logo:", error);
      toast.error("Failed to update footer logo");
    } finally {
      setUpdatingFooterImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Header Logo Card */}
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg">Header Logo</CardTitle>
            <CardDescription>Upload your website header logo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(headerImagePreview || data?.header_logo) && (
                <div className="relative aspect-[3/1] w-full max-w-md overflow-hidden rounded-lg border">
                  <img
                    src={headerImagePreview || data?.header_logo || ""}
                    alt="Header Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleHeaderImageSelect}
                  className="hidden"
                  id="header-logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("header-logo-upload")?.click()
                  }
                  disabled={updatingHeaderImage}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {data?.header_logo ? "Change Logo" : "Upload Logo"}
                </Button>
                {headerImageFile && (
                  <>
                    <Button
                      size="sm"
                      onClick={handleHeaderImageUpdate}
                      disabled={updatingHeaderImage}
                    >
                      {updatingHeaderImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Update Logo"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setHeaderImageFile(null);
                        if (headerImagePreview) {
                          URL.revokeObjectURL(headerImagePreview);
                        }
                        setHeaderImagePreview("");
                      }}
                      disabled={updatingHeaderImage}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Logo Card */}
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg">Footer Logo</CardTitle>
            <CardDescription>Upload your website footer logo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(footerImagePreview || data?.footer_logo) && (
                <div className="relative aspect-[3/1] w-full max-w-md overflow-hidden rounded-lg border">
                  <img
                    src={footerImagePreview || data?.footer_logo || ""}
                    alt="Footer Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFooterImageSelect}
                  className="hidden"
                  id="footer-logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("footer-logo-upload")?.click()
                  }
                  disabled={updatingFooterImage}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {data?.footer_logo ? "Change Logo" : "Upload Logo"}
                </Button>
                {footerImageFile && (
                  <>
                    <Button
                      size="sm"
                      onClick={handleFooterImageUpdate}
                      disabled={updatingFooterImage}
                    >
                      {updatingFooterImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Update Logo"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFooterImageFile(null);
                        if (footerImagePreview) {
                          URL.revokeObjectURL(footerImagePreview);
                        }
                        setFooterImagePreview("");
                      }}
                      disabled={updatingFooterImage}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Add your social media profile links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                Object.keys(form.getValues().social_links) as SocialPlatform[]
              ).map((platform) => (
                <FormField
                  key={platform}
                  control={form.control}
                  name={`social_links.${platform}` as const}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-4">
                        <FormLabel className="mb-0 w-[120px]">
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={`Enter ${platform} URL`}
                            className="flex-1"
                            disabled={isSavingLayout}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!form.formState.isDirty || isSavingLayout}
              className="min-w-[200px]"
            >
              {isSavingLayout ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save All Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
