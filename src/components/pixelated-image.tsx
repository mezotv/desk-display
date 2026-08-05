import type { PixelatedImageProps } from "@/types/pixelated-image";

export function PixelatedImage({
  alt,
  className,
  src,
}: PixelatedImageProps) {
  const imageClassName = ["[image-rendering:pixelated]", className]
    .filter(Boolean)
    .join(" ");
  const versionedSource = src.startsWith("/")
    ? `${src}${src.includes("?") ? "&" : "?"}deskDisplayVersion=${encodeURIComponent(__DESK_DISPLAY_VERSION__)}`
    : src;

  return <img alt={alt} className={imageClassName} src={versionedSource} />;
}
