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
import { Upload, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSettings } from "@/hooks/use-settings";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  logo_url: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function HeaderSettings() {
  const { data, uploadLogo, isUploading } = useSettings();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logo_url: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        logo_url: data.logo_url || "",
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

  return (
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
              onClick={() => document.getElementById("logo-upload")?.click()}
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
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Uploading..." : "Save Logo"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
