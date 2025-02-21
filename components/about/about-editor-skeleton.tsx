import { Skeleton } from "@/components/ui/skeleton";

export function AboutEditorSkeleton() {
  return (
    <div className="p-6">
      <div className="rounded-lg bg-card">
        <div className="p-6 space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-[80px]" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>

          {/* Mission */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-[100px]" /> {/* Label */}
            <Skeleton className="h-24 w-full" /> {/* Text area */}
          </div>

          {/* Vision */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-[90px]" /> {/* Label */}
            <Skeleton className="h-24 w-full" /> {/* Text area */}
          </div>

          {/* Where I Am */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-[120px]" /> {/* Label */}
            <Skeleton className="h-24 w-full" /> {/* Text area */}
          </div>

          {/* Links */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-[70px]" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
        </div>
      </div>
    </div>
  );
} 