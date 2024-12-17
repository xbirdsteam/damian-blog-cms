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
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSettings } from "@/hooks/use-settings";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  logo_url: z.string(),
  navigation: z.array(
    z.object({
      label: z.string().min(1, "Label is required"),
      url: z.string().min(1, "URL is required"),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

export function HeaderSettings() {
  const { data, uploadLogo, updateNavigation, isUploading } = useSettings();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logo_url: "",
      navigation: [{ label: "", url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "navigation",
  });

  useEffect(() => {
    if (data) {
      form.reset({
        logo_url: data.logo_url || "",
        navigation: data.navigation || [{ label: "", url: "" }],
      });
    }
  }, [data, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("logo_url", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async () => {
    if (logoFile) {
      try {
        const url = await uploadLogo(logoFile);
        form.setValue("logo_url", url);
        setLogoFile(null);
      } catch (error) {
        console.error("Error uploading logo:", error);
      }
    }
  };

  const onSubmit = async (values: FormValues) => {
    await updateNavigation(values.navigation);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Logo Settings</CardTitle>
            <CardDescription>
              Configure your website logo and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {form.watch("logo_url") && (
                <div className="relative aspect-[3/1] w-[200px] overflow-hidden rounded-lg border">
                  <Image
                    src={form.watch("logo_url")}
                    alt="Logo Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("logo-upload")?.click()
                  }
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Logo
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveLogo}
                  disabled={!logoFile || isUploading}
                >
                  {isUploading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isUploading ? "Uploading..." : "Save Logo"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation Links</CardTitle>
            <CardDescription>
              Manage your website navigation menu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4">
                <FormField
                  control={form.control}
                  name={`navigation.${index}.label`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Menu item label" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`navigation.${index}.url`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Menu item URL" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ label: "", url: "" })}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!form.formState.isDirty}
            className="min-w-[200px]"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Navigation"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
