import { useEffect, useRef, useState } from "react";

import {
  DEFAULT_PIXELIZER_SETTINGS,
  DISPLAY_PIXELIZER_MAX_DIMENSION,
} from "@/constants/pixelizer";
import type { PixelatedImageProps } from "@/types/pixelated-image";
import { renderPixelatedImage } from "@/utils/render-pixelated-image";

export function PixelatedImage({
  alt,
  className,
  src,
}: PixelatedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const imageClassName = ["[image-rendering:pixelated]", className]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const image = new Image();

    setFailed(false);
    const imageUrl = new URL(src, window.location.href);
    if (imageUrl.origin !== window.location.origin) {
      image.crossOrigin = "anonymous";
    }
    image.decoding = "async";
    image.onload = () => {
      if (cancelled) return;

      try {
        renderPixelatedImage(
          canvas,
          image,
          DEFAULT_PIXELIZER_SETTINGS,
          DISPLAY_PIXELIZER_MAX_DIMENSION,
        );
      } catch (error) {
        console.error(`Unable to pixelize ${src}`, error);
        setFailed(true);
      }
    };
    image.onerror = () => {
      if (!cancelled) setFailed(true);
    };
    image.src = src;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
      image.removeAttribute("src");
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [src]);

  if (failed) {
    return <img alt={alt} className={imageClassName} src={src} />;
  }

  return (
    <canvas
      aria-hidden={alt ? undefined : true}
      aria-label={alt || undefined}
      className={imageClassName}
      ref={canvasRef}
      role={alt ? "img" : undefined}
    />
  );
}
