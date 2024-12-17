"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { FooterSettings } from "./footer-settings";
import { HeaderSettings } from "./header-settings";

export function GlobalSettings() {
  const { isLoading } = useSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[300px]" />
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-2xl font-semibold">Layout Settings</h2>
        <p className="text-muted-foreground">
          Customize your website&apos;s header and footer appearance
        </p>
      </div>
      <Tabs defaultValue="header" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] p-1">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>
        <div className="border rounded-lg p-1">
          <TabsContent value="header" className="space-y-4 p-4">
            <div className="flex items-center gap-2 pb-4 border-b">
              <div>
                <h3 className="font-medium">Header Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your website&apos;s header, logo, and navigation menu
                </p>
              </div>
            </div>
            <HeaderSettings />
          </TabsContent>
          <TabsContent value="footer" className="space-y-4 p-4">
            <div className="flex items-center gap-2 pb-4 border-b">
              <div>
                <h3 className="font-medium">Footer Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Customize your website&apos;s footer content and social links
                </p>
              </div>
            </div>
            <FooterSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
