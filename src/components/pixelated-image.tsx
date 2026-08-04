import type { PixelatedImageProps } from "@/types/pixelated-image";

export function PixelatedImage({
  alt,
  className,
  src,
}: PixelatedImageProps) {
  const imageClassName = ["[image-rendering:pixelated]", className]
    .filter(Boolean)
    .join(" ");

  return <img alt={alt} className={imageClassName} src={src} />;
}
