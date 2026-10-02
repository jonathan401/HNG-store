import { cn } from "@/lib/utils";
import Image from "next/image";

export function ProductImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return <div className={cn("absolute inset-0 bg-store-mist", className)} aria-hidden />;
  }

  if (src.startsWith("https://images.unsplash.com/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    // Arbitrary catalog URLs are not limited to one image host.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
