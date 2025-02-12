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
import { UpdateLayoutOptions } from "@/services/settings-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Trash2 } from "lucide-react";
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

function LogoUploadCard({
  title,
  description,
  logoUrl,
  isUploading,
  onUpload,
  onRemove,
  type,
}: {
  title: string;
  description: string;
  logoUrl: string | null;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  type: "header" | "footer";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Logo Preview Area */}
          <div className="relative group">
            {logoUrl ? (
              <div className="relative aspect-[3/1] rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center border">
                <img
                  src={logoUrl}
                  alt={`${type} Logo`}
                  className="max-h-24 w-auto object-contain"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      document.getElementById(`${type}-logo`)?.click()
                    }
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onRemove}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="aspect-[3/1] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById(`${type}-logo`)?.click()}
              >
                <div className="rounded-full bg-muted/30 p-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    SVG, PNG, JPG or GIF (Max. 2MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            id={`${type}-logo`}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full w-full animate-pulse" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function LayoutSettings({ id }: IProps) {
  const { data, updateLayout, isSavingLayout, uploadLogo } = useSettings();
  const [isUploadingHeaderLogo, setIsUploadingHeaderLogo] = useState(false);
  const [isUploadingFooterLogo, setIsUploadingFooterLogo] = useState(false);

  // Initialize with data if available
  const [headerLogo, setHeaderLogo] = useState<string | null>(null);
  const [footerLogo, setFooterLogo] = useState<string | null>(null);

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

  const handleLogoUpload = async (file: File, type: "header" | "footer") => {
    const setLoading =
      type === "header" ? setIsUploadingHeaderLogo : setIsUploadingFooterLogo;
    const setLogo = type === "header" ? setHeaderLogo : setFooterLogo;
    const otherLogo = type === "header" ? footerLogo : headerLogo;

    try {
      setLoading(true);
      const url = await uploadLogo({ file, type });
      setLogo(url);
      await updateLayout({
        id,
        header_logo: type === "header" ? url : otherLogo,
        footer_logo: type === "footer" ? url : otherLogo,
      });
    } catch (error) {
      console.error(`Error uploading ${type} logo:`, error);
      toast.error(`Failed to upload ${type} logo`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveHeaderLogo = async () => {
    try {
      setHeaderLogo(null);
      await updateLayout({
        id,
        header_logo: null,
        footer_logo: footerLogo,
      });
      toast.success("Header logo removed successfully");
    } catch (error) {
      console.error("Error removing header logo:", error);
      toast.error("Failed to remove header logo");
    }
  };

  const handleRemoveFooterLogo = async () => {
    try {
      setFooterLogo(null);
      await updateLayout({
        id,
        header_logo: headerLogo,
        footer_logo: null,
      });
      toast.success("Footer logo removed successfully");
    } catch (error) {
      console.error("Error removing footer logo:", error);
      toast.error("Failed to remove footer logo");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Logo */}
      <LogoUploadCard
        title="Header Logo"
        description="Upload your website header logo"
        logoUrl={headerLogo}
        isUploading={isUploadingHeaderLogo}
        onUpload={(file) => handleLogoUpload(file, "header")}
        onRemove={handleRemoveHeaderLogo}
        type="header"
      />

      {/* Footer Logo */}
      <LogoUploadCard
        title="Footer Logo"
        description="Upload your website footer logo"
        logoUrl={footerLogo}
        isUploading={isUploadingFooterLogo}
        onUpload={(file) => handleLogoUpload(file, "footer")}
        onRemove={handleRemoveFooterLogo}
        type="footer"
      />

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
