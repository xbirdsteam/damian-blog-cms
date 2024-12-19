/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { useAboutData } from "@/hooks/use-about-data";
import { TimelineItem } from "@/types/about";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { EditDialog } from "./edit-dialog";
import { TimelineDialog } from "./timeline-dialog";
import { ImageDialog } from "./image-dialog";
import { SeoSettingsModal } from "@/components/common/seo-settings-modal";
import * as z from "zod";

// Add SEO schema
const seoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  keywords: z.string().min(1, "Keywords are required"),
  og_image: z.string().optional(),
});

export function AboutEditor() {
  const {
    data,
    isLoading,
    updateData,
    updateTimeline,
    uploadImage,
    updateSEO,
  } = useAboutData();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const handleUpdateTitle = async (newTitle: string) => {
    await updateData({ title: newTitle });
  };

  const handleUpdateIntroduction = async (newIntro: string) => {
    await updateData({ introduction: newIntro });
  };

  const handleUpdateTimeline = async (newTimeline: TimelineItem[]) => {
    await updateTimeline(newTimeline);
  };

  const handleUpdateClosing = async (newClosing: string) => {
    await updateData({ closing_paragraph: newClosing });
  };

  const handleUploadImage = async (file: File) => {
    await uploadImage({ file });
  };

  const handleSeoSubmit = async (values: z.infer<typeof seoSchema>) => {
    try {
      await updateSEO({
        seo_title: values.title,
        seo_description: values.description,
        seo_keywords: values.keywords,
        og_image: values.og_image || "",
      });
    } catch (error) {
      console.error("Error updating SEO settings:", error);
    }
  };

  const handleSeoImageUpload = async (file: File) => {
    const url = await uploadImage({
      file,
      path: "about/seo/og-image",
    });
    return url;
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto space-y-12 px-2 sm:px-4 pb-12 md:space-y-24 md:pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">About Page</h1>
        <SeoSettingsModal
          defaultValues={{
            title: data?.seo_title ?? "",
            description: data?.seo_description ?? "",
            keywords: data?.seo_keywords ?? "",
            og_image: data?.og_image ?? "",
          }}
          onSubmit={handleSeoSubmit}
          onImageUpload={handleSeoImageUpload}
          isSaving={isLoading}
          pageName="About"
        />
      </div>

      {/* Title Section */}
      <section className="group relative flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <div className="w-auto md:w-16 md:text-center">
          <span className="text-sm font-medium text-muted-foreground">01</span>
        </div>
        <div className="flex-1 space-y-4 border-l-2 border-primary pl-3 sm:pl-4 md:pl-8">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Title
          </span>
          <p className="text-4xl md:text-6xl font-bold tracking-tight">
            {data?.title}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingSection("title")}
          className="absolute right-0 top-0 opacity-100 md:relative md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </section>

      {/* Introduction */}
      <section className="group relative flex flex-col gap-2 md:flex-row md:gap-4">
        <div className="w-auto md:w-16 md:text-center">
          <span className="text-sm font-medium text-muted-foreground">02</span>
        </div>
        <div className="flex-1 space-y-4 border-l-2 border-primary pl-3 sm:pl-4 md:pl-8">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Introduction
          </span>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
            {data?.introduction}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingSection("introduction")}
          className="absolute right-0 top-0 opacity-100 md:relative md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </section>

      {/* Image and Timeline Section */}
      <div className="grid gap-8 xl:grid-cols-2 xl:gap-12">
        {/* Profile Image */}
        <section className="group relative flex flex-col gap-2 md:flex-row md:gap-4">
          <div className="w-auto md:w-16 md:text-center">
            <span className="text-sm font-medium text-muted-foreground">
              03
            </span>
          </div>
          <div className="flex-1 space-y-4 border-l-2 border-primary pl-3 sm:pl-4 md:pl-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Profile Image
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingSection("image")}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl border bg-muted group/image">
              <div className="absolute inset-0 -translate-x-full group-hover/image:animate-sweep bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <img
                src={
                  data?.image_url ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=1067&fit=crop"
                }
                alt="Profile"
                className="aspect-[3/4] h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Timeline History */}
        <section className="group relative flex flex-col gap-2 md:flex-row md:gap-4">
          <div className="w-auto md:w-16 md:text-center">
            <span className="text-sm font-medium text-muted-foreground">
              04
            </span>
          </div>
          <div className="flex-1 space-y-4 border-l-2 border-primary pl-3 sm:pl-4 md:pl-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Timeline History
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingSection("timeline")}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative space-y-6">
              <div className="absolute left-3 top-4 bottom-4 w-px bg-gradient-to-b from-primary/20 via-primary to-primary/20" />
              {data?.timeline?.map((item) => (
                <div
                  key={item.year}
                  className="group/item relative pl-10 transition-all hover:pl-12 duration-300"
                >
                  <div className="absolute left-0 top-[22px] h-px w-8 bg-gradient-to-r from-transparent via-primary to-primary" />
                  <div className="absolute left-[29px] top-5 h-2 w-2 -translate-y-1/2 rotate-45 border border-primary bg-background" />
                  <div className="rounded-lg border border-border/50 bg-card p-4 shadow-sm transition-colors hover:border-primary">
                    <div className="mb-2 text-sm font-semibold text-primary">
                      {item.year}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Closing Paragraph */}
      <section className="group relative flex flex-col gap-2 md:flex-row md:gap-4">
        <div className="w-auto md:w-16 md:text-center">
          <span className="text-sm font-medium text-muted-foreground">05</span>
        </div>
        <div className="flex-1 space-y-4 border-l-2 border-primary pl-3 sm:pl-4 md:pl-8">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Closing Statement
          </span>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
            {data?.closing_paragraph}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingSection("closing")}
          className="absolute right-0 top-0 opacity-100 md:relative md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </section>

      {/* Edit Dialogs */}
      <EditDialog
        open={editingSection === "title"}
        onOpenChange={(open) => !open && setEditingSection(null)}
        title="Page Title"
        content={data?.title ?? ""}
        onSave={handleUpdateTitle}
        inputType="input"
      />
      <EditDialog
        open={editingSection === "introduction"}
        onOpenChange={(open) => !open && setEditingSection(null)}
        title="Introduction"
        content={data?.introduction ?? ""}
        onSave={handleUpdateIntroduction}
      />
      <EditDialog
        open={editingSection === "closing"}
        onOpenChange={(open) => !open && setEditingSection(null)}
        title="Closing Paragraph"
        content={data?.closing_paragraph ?? ""}
        onSave={handleUpdateClosing}
      />
      <TimelineDialog
        open={editingSection === "timeline"}
        onOpenChange={(open) => !open && setEditingSection(null)}
        items={data?.timeline ?? []}
        onSave={handleUpdateTimeline}
      />
      <ImageDialog
        open={editingSection === "image"}
        onOpenChange={(open) => !open && setEditingSection(null)}
        currentImage={
          data?.image_url ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=1067&fit=crop"
        }
        onSave={handleUploadImage}
      />
    </div>
  );
}
