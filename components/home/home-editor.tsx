"use client";

import { SeoSettingsModal } from "@/components/common/seo-settings-modal";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHomeSettings } from "@/hooks/use-home-settings";
import { useSEO } from "@/hooks/use-seo";
import { uploadHomeImage } from "@/services/home-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Layout, Mail, Type } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import { Card, CardContent, CardHeader } from "../ui/card";
import { AboutSection } from "./about-section";
import { ContactSection } from "./contact-section";
import { HeroSection } from "./hero-section";
import { RecipeSection } from "./recipe-section";
import { formSchema, seoSchema } from "./types";

type FormValues = z.infer<typeof formSchema>;

export function HomeEditor() {
  const { data, isLoading: isSettingsLoading, isSaving } = useHomeSettings();

  const seoRefId = data?.id || uuidv4();
  const {
    seoConfig,
    updateSEO,
    isUpdating: isUpdatingSEO,
  } = useSEO(seoRefId, "home");

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
        about_bio: "",
      },
      recipes: {
        video_url: "",
        title: "",
        description: "",
        button_url: "",
        heading: "",
      },
      contact: {
        title: "",
        description: "",
        receiver_email: "",
        industries: [],
        button_url: "",
        heading: "",
        subheading: "",
        text: "",
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
            desktop: data.hero_desktop_img_url || "",
            mobile: data.hero_mobile_img_url || "",
          },
        },
        about: {
          title: data.about_title || "",
          description: data.about_description || "",
          image_url: data.about_img_url || "",
          button_url: data.about_more_url || "",
          about_bio: data.about_bio || "",
        },
        recipes: {
          title: data.recipe_title || "",
          description: data.recipe_description || "",
          video_url: data.recipe_video_url || "",
          button_url: data.recipe_more_url || "",
          heading: data.recipe_heading || "",
        },
        contact: {
          title: data.contact_title || "",
          description: data.contact_description || "",
          receiver_email: data.contact_receiver_email || "",
          industries: data.contact_industry_options || [],
          heading: data.contact_heading || "",
          subheading: data.contact_subheading || "",
          text: data.contact_text || "",
          button_url: data.contact_button_url || "",
        },
        seo: {
          title: data.seo_title || "",
          description: data.seo_description || "",
          keywords: data.seo_keywords || "",
          og_image: data.og_image || "",
        },
      });
    }
  }, [data, form]);

  const handleSeoSubmit = async (values: z.infer<typeof seoSchema>) => {
    try {
      const payload: any = {
        seo_ref_id: seoRefId,
        meta_title: values.title,
        meta_description: values.description,
        meta_keywords: values.keywords,
        og_image: values.og_image || null,
        slug: "home",
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
          <form onSubmit={handleSubmit} className="space-y-8">
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
                pageName="Home"
              />
            </div>

            <Tabs defaultValue="hero" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 gap-4 bg-muted p-1">
                <TabsTrigger value="hero" className="space-x-2">
                  <Layout className="h-4 w-4" />
                  <span>Hero</span>
                </TabsTrigger>
                <TabsTrigger value="about" className="space-x-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>About</span>
                </TabsTrigger>
                <TabsTrigger value="recipes" className="space-x-2">
                  <Type className="h-4 w-4" />
                  <span>Recipes</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Contact</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hero" className="space-y-4">
                <div className="grid gap-6">
                  <HeroSection form={form} />
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-4">
                <div className="grid gap-6">
                  <AboutSection form={form} />
                </div>
              </TabsContent>

              <TabsContent value="recipes" className="space-y-4">
                <div className="grid gap-6">
                  <RecipeSection form={form} />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid gap-6">
                  <ContactSection form={form} />
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      )}
    </>
  );
}
