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
      <LayoutSettings id={data?.id || ""} />
    </div>
  );
}
