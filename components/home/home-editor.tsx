"use client";

import { SeoSettingsModal } from "@/components/common/seo-settings-modal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomeSettings } from "@/hooks/use-home-settings";
import { uploadHomeImage } from "@/services/home-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AboutSection } from "./about-section";
import { ContactSection } from "./contact-section";
import { HeroSection } from "./hero-section";
import { RecipeSection } from "./recipe-section";

const heroSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  image_url: z.string(),
  background: z.object({
    desktop: z.string(),
    mobile: z.string(),
  }),
});

const aboutSchema = z.object({
  image_url: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  button_url: z.string().url().optional().or(z.literal("")),
});

const recipeSchema = z.object({
  video_url: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  button_url: z.string().url().optional().or(z.literal("")),
});

const contactSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  receiver_email: z.string().email("Invalid email address"),
  industries: z.array(z.string()),
});

const seoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  keywords: z.string().min(1, "Keywords are required"),
  og_image: z.string(),
});

const formSchema = z.object({
  hero: heroSchema,
  about: aboutSchema,
  recipes: recipeSchema,
  contact: contactSchema,
  seo: seoSchema,
});

type FormValues = z.infer<typeof formSchema>;

export function HomeEditor() {
  const { data, isLoading: isSettingsLoading, isSaving } = useHomeSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hero: {
        title: "",
        subtitle: "",
        image_url: "",
        background: {
          desktop: "",
          mobile: "",
        },
      },
      about: {
        image_url: "",
        title: "",
        description: "",
        button_url: "",
      },
      recipes: {
        video_url: "",
        title: "",
        description: "",
        button_url: "",
      },
      contact: {
        title: "",
        description: "",
        receiver_email: "",
        industries: [],
      },
      seo: {
        title: "",
        description: "",
        keywords: "",
        og_image: "",
      },
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  useEffect(() => {
    if (data) {
      form.reset({
        hero: {
          background: {
            desktop: data.hero_image_url || "",
            mobile: data.hero_mobile_image_url || "",
          },
        },
        about: {
          title: data.about_title || "",
          description: data.about_description || "",
          image_url: data.about_image_url || "",
          button_url: data.about_more_url || "",
        },
        recipes: {
          title: data.recipes_title || "",
          description: data.recipes_description || "",
          video_url: data.recipes_video_url || "",
          button_url: data.recipes_more_url || "",
        },
        contact: {
          title: data.contact_title || "",
          description: data.contact_description || "",
          receiver_email: data.contact_receiver_email || "",
          industries: data.contact_industries || [],
        },
        seo: {
          title: "",
          description: "",
          keywords: "",
          og_image: "",
        },
      });
    }
  }, [data, form]);

  const handleSeoSubmit = async (values: z.infer<typeof seoSchema>) => {
    // Handle SEO form submission
    console.log(values);
  };

  const handleSeoImageUpload = async (file: File) => {
    return await uploadHomeImage({
      file,
      path: "home/seo/og-image",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <>
      {isSettingsLoading ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-[180px]" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-[140px]" />
              <Skeleton className="h-4 w-[240px]" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Desktop Background Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="aspect-[21/9] w-full" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-[200px]" />
                  </div>
                  <Skeleton className="h-4 w-[240px]" />
                </div>

                {/* Mobile Background Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="aspect-[21/9] w-full" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-[200px]" />
                  </div>
                  <Skeleton className="h-4 w-[240px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-[160px]" />
              <Skeleton className="h-4 w-[260px]" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="aspect-square w-[200px]" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-[180px]" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Save Button Skeleton */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-[200px]" />
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <SeoSettingsModal
                defaultValues={{
                  ...form.getValues("seo"),
                  og_image: form.getValues("seo.og_image") || "",
                }}
                onSubmit={handleSeoSubmit}
                onImageUpload={handleSeoImageUpload}
                isSaving={isSaving}
                pageName="Home"
              />
            </div>

            <HeroSection form={form} />

            <AboutSection form={form} />

            <RecipeSection form={form} />

            <ContactSection form={form} />
          </form>
        </Form>
      )}
    </>
  );
}
