"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LoadingImageProps extends Omit<ImageProps, "onLoad"> {
  onLoad?: () => void;
}

export function LoadingImage({
  className,
  onLoad,
  alt,
  ...props
}: LoadingImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Image
      className={cn(
        "duration-700 ease-in-out",
        isLoading
          ? "scale-110 blur-2xl grayscale"
          : "scale-100 blur-0 grayscale-0",
        className
      )}
      alt={alt}
      onLoad={() => {
        setIsLoading(false);
        onLoad?.();
      }}
      {...props}
    />
  );
}
