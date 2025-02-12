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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useConsultancyContent } from "@/hooks/use-consultancy";
import {
  ConsultancyContent,
  WhyWorkWithUsItem,
  ProcessStep,
  consultancyService,
} from "@/services/consultancy-service";
import { Loader2, Plus, Save, Trash2, ImageIcon, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SeoSettingsModal } from "@/components/common/seo-settings-modal";
import { useSEO } from "@/hooks/use-seo";
import { seoSchema } from "../home/types";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";

export function ConsultancyEditor() {
  const { content, isLoading, isSaving, saveContent } = useConsultancyContent();
  const [data, setData] = useState<ConsultancyContent>({
    title: "",
    description: "",
    headParagraph: {
      title: "",
      content: "",
    },
    whyWorkWithUs: [],
    processSteps: [],
    image_url: null,
    callToAction: {
      title: "",
      description: "",
    },
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const seoRefId = content?.id || uuidv4();
  const {
    seoConfig,
    updateSEO,
    isUpdating: isUpdatingSEO,
  } = useSEO(seoRefId, "consultancy");

  useEffect(() => {
    if (content) {
      setData({
        title: content.title,
        description: content.description,
        headParagraph: {
          title: content.headParagraph.title,
          content: content.headParagraph.content,
        },
        whyWorkWithUs: content.whyWorkWithUs,
        processSteps: content.processSteps,
        image_url: content.image_url,
        callToAction: content.callToAction,
      });
    }
  }, [content]);

  const addWhyWorkWithUsItem = () => {
    setData({
      ...data,
      whyWorkWithUs: [
        ...data.whyWorkWithUs,
        { id: crypto.randomUUID(), content: "" },
      ],
    });
  };

  const removeWhyWorkWithUsItem = (id: string) => {
    setData({
      ...data,
      whyWorkWithUs: data.whyWorkWithUs.filter((item) => item.id !== id),
    });
  };

  const updateWhyWorkWithUsItem = (id: string, value: string) => {
    setData({
      ...data,
      whyWorkWithUs: data.whyWorkWithUs.map((item) =>
        item.id === id ? { ...item, content: value } : item
      ),
    });
  };

  const addProcessStep = () => {
    setData({
      ...data,
      processSteps: [
        ...data.processSteps,
        { id: crypto.randomUUID(), title: "", description: "" },
      ],
    });
  };

  const removeProcessStep = (id: string) => {
    setData({
      ...data,
      processSteps: data.processSteps.filter((step) => step.id !== id),
    });
  };

  const updateProcessStep = (
    id: string,
    field: keyof ProcessStep,
    value: string
  ) => {
    setData({
      ...data,
      processSteps: data.processSteps.map((step) =>
        step.id === id ? { ...step, [field]: value } : step
      ),
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const url = await consultancyService.uploadImage(file);
      setData({ ...data, image_url: url });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveContent(data);
      toast.success("Content saved successfully");
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    }
  };

  const handleSeoSubmit = async (values: z.infer<typeof seoSchema>) => {
    try {
      const payload: any = {
        seo_ref_id: seoRefId,
        meta_title: values.title,
        meta_description: values.description,
        meta_keywords: values.keywords,
        og_image: values.og_image || null,
        slug: "consultancy",
      };

      if (seoConfig?.id) {
        payload.id = seoConfig.id;
      }

      await updateSEO(payload);
    } catch (error) {
      console.error("Error updating SEO settings:", error);
    }
  };

  const handleSeoImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", "consultancy/seo/og-image");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error("Error uploading SEO image:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center border-b pb-4">
        <SeoSettingsModal
          defaultValues={{
            title: seoConfig?.meta_title || "",
            description: seoConfig?.meta_description || "",
            keywords: seoConfig?.meta_keywords || "",
            og_image: seoConfig?.og_image || "",
          }}
          onSubmit={handleSeoSubmit}
          onImageUpload={handleSeoImageUpload}
          isSaving={isUpdatingSEO}
          pageName="Consultancy"
        />
      </div>

      {/* Image Upload Card - Moved to top */}
      <Card>
        <CardHeader>
          <CardTitle>Page Image</CardTitle>
          <CardDescription>
            Upload an image for your consultancy page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {data.image_url ? (
              <div className="relative">
                <img
                  src={data.image_url}
                  alt="Consultancy"
                  className="h-40 w-40 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2"
                  onClick={() => setData({ ...data, image_url: null })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                id="image"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
              <Button
                variant="outline"
                disabled={isUploadingImage}
                onClick={() => document.getElementById("image")?.click()}
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>Main Content</CardTitle>
          <CardDescription>
            Edit the main content of your consultancy page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              placeholder="Enter page title"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={data.description}
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
              placeholder="Enter page description"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Head Paragraph</label>
            <Input
              value={data.headParagraph.title}
              onChange={(e) =>
                setData({
                  ...data,
                  headParagraph: {
                    ...data.headParagraph,
                    title: e.target.value,
                  },
                })
              }
              placeholder="Enter head paragraph title"
            />
            <Textarea
              value={data.headParagraph.content}
              onChange={(e) =>
                setData({
                  ...data,
                  headParagraph: {
                    ...data.headParagraph,
                    content: e.target.value,
                  },
                })
              }
              placeholder="Enter head paragraph content"
            />
          </div>
        </CardContent>
      </Card>

      {/* Why Work With Us Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Why Work With Us</CardTitle>
            <CardDescription>
              Add reasons to work with your consultancy
            </CardDescription>
          </div>
          <Button onClick={addWhyWorkWithUsItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Reason
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.whyWorkWithUs.map((item, index) => (
            <div
              key={item.id}
              className="relative space-y-2 p-4 border rounded-lg group"
            >
              <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={item.content}
                  onChange={(e) =>
                    updateWhyWorkWithUsItem(item.id, e.target.value)
                  }
                  placeholder="Enter reason"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeWhyWorkWithUsItem(item.id)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Process Steps Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Our 3-Step Process</CardTitle>
            <CardDescription>Define your consultation process</CardDescription>
          </div>
          <Button
            onClick={addProcessStep}
            disabled={data.processSteps.length >= 3}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.processSteps.map((step, index) => (
            <div
              key={step.id}
              className="relative space-y-2 p-4 border rounded-lg group"
            >
              <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={step.title}
                  onChange={(e) =>
                    updateProcessStep(step.id, "title", e.target.value)
                  }
                  placeholder="Enter step title"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProcessStep(step.id)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={step.description}
                onChange={(e) =>
                  updateProcessStep(step.id, "description", e.target.value)
                }
                placeholder="Enter step description"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Call to Action Card */}
      <Card>
        <CardHeader>
          <CardTitle>Call to Action</CardTitle>
          <CardDescription>
            Edit the call to action section at the bottom of the page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={data.callToAction.title}
              onChange={(e) =>
                setData({
                  ...data,
                  callToAction: {
                    ...data.callToAction,
                    title: e.target.value,
                  },
                })
              }
              placeholder="Enter call to action title"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={data.callToAction.description}
              onChange={(e) =>
                setData({
                  ...data,
                  callToAction: {
                    ...data.callToAction,
                    description: e.target.value,
                  },
                })
              }
              placeholder="Enter call to action description"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
