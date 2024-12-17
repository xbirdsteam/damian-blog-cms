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
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/use-settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Instagram, Linkedin, Loader2, Youtube } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  website_title: z.string().min(1, "Website title is required"),
  copyright: z.string().min(1, "Copyright text is required"),
  social_links: z.object({
    instagram: z.string().url().optional().or(z.literal("")),
    youtube: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
  }),
});

type FormValues = z.infer<typeof formSchema>;

type SocialPlatform = keyof FormValues["social_links"];

const socialIcons: Record<SocialPlatform, JSX.Element> = {
  instagram: <Instagram className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  website: <Globe className="h-4 w-4" />,
};

export function FooterSettings() {
  const { data, updateFooter, isSavingFooter } = useSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      website_title: "",
      copyright: "",
      social_links: {
        instagram: "",
        youtube: "",
        linkedin: "",
        website: "",
      },
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        website_title: data.website_title || "",
        copyright: data.copyright || "",
        social_links: {
          instagram: data.social_links?.instagram || "",
          youtube: data.social_links?.youtube || "",
          linkedin: data.social_links?.linkedin || "",
          website: data.social_links?.website || "",
        },
      });
    }
  }, [data, form]);

  const onSubmit = async (values: FormValues) => {
    await updateFooter(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Information</CardTitle>
            <CardDescription>
              Configure your website title and copyright information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="website_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter website title"
                      {...field}
                      disabled={isSavingFooter}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="copyright"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Copyright Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter copyright text"
                      {...field}
                      disabled={isSavingFooter}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>
              Add your social media profile links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              Object.entries(socialIcons) as [SocialPlatform, JSX.Element][]
            ).map(([platform, icon]) => (
              <FormField
                key={platform}
                control={form.control}
                name={`social_links.${platform}` as const}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-4">
                      <div className="flex w-[120px] items-center gap-2">
                        {icon}
                        <FormLabel className="mb-0">
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={`Enter ${platform} URL`}
                          className="flex-1"
                          disabled={isSavingFooter}
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
            disabled={!form.formState.isDirty || isSavingFooter}
            className="min-w-[200px]"
          >
            {isSavingFooter ? (
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
  );
}
