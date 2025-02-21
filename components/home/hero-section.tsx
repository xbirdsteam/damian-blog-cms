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
import { deleteFile, getPathFromUrl, uploadImage } from "@/services";
import { Loader2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { FormValues } from "./types";

interface HeroSectionProps {
  form: UseFormReturn<FormValues>;
}

export function HeroSection({ form }: HeroSectionProps) {
  const { data, handleSectionUpdate } = useHomeSettings();
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    desktop?: string;
    mobile?: string;
  }>({});
  const [updatingDesktop, setUpdatingDesktop] = useState(false);
  const [updatingMobile, setUpdatingMobile] = useState(false);

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

  const handleDesktopImageUpdate = async () => {
    if (!desktopFile) return;

    try {
      setUpdatingDesktop(true);
      const currentImageUrl = data?.hero_desktop_img_url;
      const uploadTasks: Promise<string | boolean>[] = [];

      if (currentImageUrl) {
        const path = getPathFromUrl(currentImageUrl, "images");
        if (path) {
          uploadTasks.push(deleteFile(path, "images"));
        }
      }

      uploadTasks.push(uploadImage(desktopFile, "hero/desktop"));

      const results = await Promise.all(uploadTasks);
      const imageUrl = results[results.length - 1] as string;

      await handleSectionUpdate(data?.id || "", "hero", {
        hero_desktop_img_url: imageUrl,
      });

      if (previewImage.desktop) {
        URL.revokeObjectURL(previewImage.desktop);
      }
      setPreviewImage((prev) => ({ ...prev, desktop: imageUrl }));
      setDesktopFile(null);
      form.setValue("hero.background.desktop", imageUrl);

      toast.success("Desktop background updated successfully");
    } catch (error) {
      console.error("Error uploading desktop background:", error);
      toast.error("Failed to update desktop background");
    } finally {
      setUpdatingDesktop(false);
    }
  };

  const handleMobileImageUpdate = async () => {
    if (!mobileFile) return;

    try {
      setUpdatingMobile(true);
      const currentImageUrl = data?.hero_mobile_img_url;
      const uploadTasks: Promise<string | boolean>[] = [];

      if (currentImageUrl) {
        const path = getPathFromUrl(currentImageUrl, "images");
        if (path) {
          uploadTasks.push(deleteFile(path, "images"));
        }
      }

      uploadTasks.push(uploadImage(mobileFile, "hero/mobile"));

      const results = await Promise.all(uploadTasks);
      const imageUrl = results[results.length - 1] as string;

      await handleSectionUpdate(data?.id || "", "hero", {
        hero_mobile_img_url: imageUrl,
      });

      if (previewImage.mobile) {
        URL.revokeObjectURL(previewImage.mobile);
      }
      setPreviewImage((prev) => ({ ...prev, mobile: imageUrl }));
      setMobileFile(null);
      form.setValue("hero.background.mobile", imageUrl);

      toast.success("Mobile background updated successfully");
    } catch (error) {
      console.error("Error uploading mobile background:", error);
      toast.error("Failed to update mobile background");
    } finally {
      setUpdatingMobile(false);
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
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="hero.background.desktop"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-4">
                      {(previewImage.desktop || data?.hero_desktop_img_url) && (
                        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border">
                          <LoadingImage
                            src={
                              previewImage.desktop || data?.hero_desktop_img_url
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
                          disabled={updatingDesktop}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {data?.hero_desktop_img_url
                            ? "Change Desktop Background"
                            : "Choose Desktop Background"}
                        </Button>
                        {desktopFile && (
                          <>
                            <Button
                              onClick={handleDesktopImageUpdate}
                              disabled={updatingDesktop}
                            >
                              {updatingDesktop ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                "Update Background"
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setDesktopFile(null);
                                if (previewImage.desktop) {
                                  URL.revokeObjectURL(previewImage.desktop);
                                }
                                setPreviewImage((prev) => ({
                                  ...prev,
                                  desktop: undefined,
                                }));
                              }}
                              disabled={updatingDesktop}
                            >
                              Cancel
                            </Button>
                          </>
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
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="hero.background.mobile"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-4">
                      {(previewImage.mobile || data?.hero_mobile_img_url) && (
                        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border">
                          <LoadingImage
                            src={
                              previewImage.mobile || data?.hero_mobile_img_url
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
                          disabled={updatingMobile}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {data?.hero_mobile_img_url
                            ? "Change Mobile Background"
                            : "Choose Mobile Background"}
                        </Button>
                        {mobileFile && (
                          <>
                            <Button
                              onClick={handleMobileImageUpdate}
                              disabled={updatingMobile}
                            >
                              {updatingMobile ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                "Update Background"
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setMobileFile(null);
                                if (previewImage.mobile) {
                                  URL.revokeObjectURL(previewImage.mobile);
                                }
                                setPreviewImage((prev) => ({
                                  ...prev,
                                  mobile: undefined,
                                }));
                              }}
                              disabled={updatingMobile}
                            >
                              Cancel
                            </Button>
                          </>
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
