"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface LoadingImageProps extends React.ComponentProps<typeof Image> {
  containerClassName?: string;
}

export function LoadingImage({
  containerClassName,
  className,
  onLoadingComplete,
  ...props
}: LoadingImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn("relative size-full", containerClassName)}>
      <Image
        className={cn("transition-opacity", className, {
          "opacity-0": isLoading,
          "opacity-100": !isLoading,
        })}
        onLoadingComplete={(img) => {
          setIsLoading(false);
          onLoadingComplete?.(img);
        }}
        {...props}
      />
      {isLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
    </div>
  );
}
