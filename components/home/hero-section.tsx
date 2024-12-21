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
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingImage } from "@/components/ui/loading-image";
import { useHomeSettings } from "@/hooks/use-home-settings";
import { homeService, uploadHomeImage } from "@/services/home-service";
import { addCacheBuster } from "@/utils/url-helpers";
import { Loader2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { FormValues } from "./types";

interface HeroSectionProps {
  form: UseFormReturn<FormValues>;
}

export function HeroSection({ form }: HeroSectionProps) {
  const { data, isSaving, handleImageUpdate } = useHomeSettings();
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    desktop?: string;
    mobile?: string;
  }>({});
  const [uploadingType, setUploadingType] = useState<
    "desktop" | "mobile" | null
  >(null);

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "desktop" | "mobile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewImage[type]) {
      URL.revokeObjectURL(previewImage[type]!);
    }

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage((prev) => ({
      ...prev,
      [type]: previewUrl,
    }));

    if (type === "desktop") {
      setDesktopFile(file);
    } else {
      setMobileFile(file);
    }
  };

  const handleUpload = async (type: "desktop" | "mobile") => {
    try {
      setUploadingType(type);
      let currentId = data?.id;

      if (!currentId) {
        const newData = await homeService.createHomeSettings();
        currentId = newData.id;
        form.reset(newData);
      }

      const file = type === "desktop" ? desktopFile : mobileFile;
      if (!file) return;

      const url = await uploadHomeImage({
        file,
        path: `hero/${type}`,
      });

      await handleImageUpdate(currentId, type, url);

      if (previewImage[type]) {
        URL.revokeObjectURL(previewImage[type]!);
      }

      if (type === "desktop") {
        setDesktopFile(null);
      } else {
        setMobileFile(null);
      }

      setPreviewImage((prev) => ({
        ...prev,
        [type]: undefined,
      }));

      const finalUrl = addCacheBuster(url);
      form.setValue(`hero.background.${type}`, finalUrl);

      toast.success(
        `${
          type === "desktop" ? "Desktop" : "Mobile"
        } background updated successfully`
      );
    } catch (error) {
      console.error(`Error in upload (${type}):`, error);
      toast.error(
        `Failed to update ${
          type === "desktop" ? "desktop" : "mobile"
        } background`
      );
    } finally {
      setUploadingType(null);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(previewImage).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewImage]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Hero Section</h2>
          <p className="text-sm text-muted-foreground">
            Configure your homepage hero section appearance
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Desktop Background */}
        <Card>
          <CardHeader>
            <CardTitle>Desktop Background</CardTitle>
            <CardDescription>Recommended size: 1920x1080px</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="hero.background.desktop"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-4">
                      {(previewImage.desktop || data?.hero_image_url) && (
                        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border">
                          <LoadingImage
                            src={
                              previewImage.desktop ||
                              addCacheBuster(data?.hero_image_url)
                            }
                            alt="Desktop Background Preview"
                            className="object-cover"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageSelect(e, "desktop")}
                          className="hidden"
                          id="hero-desktop-bg-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document
                              .getElementById("hero-desktop-bg-upload")
                              ?.click()
                          }
                          disabled={isSaving}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {data?.hero_image_url
                            ? "Change Desktop Background"
                            : "Choose Desktop Background"}
                        </Button>
                        {desktopFile && (
                          <Button
                            type="button"
                            onClick={() => handleUpload("desktop")}
                            disabled={isSaving || uploadingType === "desktop"}
                          >
                            {uploadingType === "desktop" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Mobile Background */}
        <Card>
          <CardHeader>
            <CardTitle>Mobile Background</CardTitle>
            <CardDescription>Recommended size: 750x1334px</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="hero.background.mobile"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-4">
                      {(previewImage.mobile || data?.hero_mobile_image_url) && (
                        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border">
                          <LoadingImage
                            src={
                              previewImage.mobile ||
                              addCacheBuster(data?.hero_mobile_image_url)
                            }
                            alt="Mobile Background Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageSelect(e, "mobile")}
                          className="hidden"
                          id="hero-mobile-bg-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document
                              .getElementById("hero-mobile-bg-upload")
                              ?.click()
                          }
                          disabled={isSaving}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {data?.hero_mobile_image_url
                            ? "Change Mobile Background"
                            : "Choose Mobile Background"}
                        </Button>
                        {mobileFile && (
                          <Button
                            type="button"
                            onClick={() => handleUpload("mobile")}
                            disabled={isSaving || uploadingType === "mobile"}
                          >
                            {uploadingType === "mobile" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
