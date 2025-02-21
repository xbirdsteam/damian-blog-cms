import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageElementProps {
  urls: string[];
}

export default function ImageElement({ urls }: ImageElementProps) {
  if (!urls || urls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {urls.map((url, index) => {
        // Check if this is the last image and there's an odd number of images
        const isLastOddImage =
          index === urls.length - 1 && urls.length % 2 === 1;

        return (
          <div
            className={cn(
              "relative",
              // Single image
              urls.length === 1
                ? "aspect-[2] min-h-[400px] w-full"
                : // Multiple images
                  "mlg:flex-1", // On large screens, all images share equal width
              // On mobile (<mlg), handle 2 per row
              urls.length > 1 && "max-mlg:w-[calc(50%-8px)]",
              // Last odd image on mobile takes full width
              isLastOddImage && "max-mlg:aspect-[2] max-mlg:w-full",
              // Square aspect for all other cases
              urls.length > 1 && "aspect-square"
            )}
            key={index}
          >
            <Image
              src={url}
              alt={`content-image-${index + 1}`}
              fill
              className="object-cover object-center"
            />
          </div>
        );
      })}
    </div>
  );
}
