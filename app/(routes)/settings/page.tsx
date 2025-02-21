import { GlobalSettings } from "@/components/settings/global-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function SettingsLoading() {
  return (
    <div className="h-full py-6">
      <Skeleton className="h-8 w-[200px] mb-8" />
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[300px]" />
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <div className="h-full p-6">
        <GlobalSettings />
      </div>
    </Suspense>
  );
}
