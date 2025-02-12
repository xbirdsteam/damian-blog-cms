"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/use-settings";
import { LayoutSettings } from "./layout-settings";

export function GlobalSettings() {
  const { isLoading, data } = useSettings();

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
      <LayoutSettings id={data?.id || ""} />
    </div>
  );
}
