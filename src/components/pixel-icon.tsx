import type { PixelIconProps } from "@/types/pixel-icon"

const PIXEL_PATHS = {
  back: "M4 10h4V8h4V6h4v4h4v4h-4v4h-4v-2H8v-2H4z",
  backspace: "M3 10h2V8h2V6h14v12H7v-2H5v-2H3zm7-1v2h2v2h-2v2h3v-2h2v2h3v-3h-2v-2h2V7h-3v2h-2V7h-3v2z",
  check: "M3 11h4v3h3v3h3v-3h2v-3h2V8h4v5h-2v3h-2v3h-2v2H9v-2H7v-2H5v-2H3z",
  close: "M5 5h4v3h2v2h2V8h2V5h4v4h-3v2h-2v2h2v2h3v4h-4v-3h-2v-2h-2v2H9v3H5v-4h3v-2h2v-2H8V9H5z",
  minus: "M4 10h16v4H4z",
  pause: "M5 4h5v16H5zm9 0h5v16h-5z",
  play: "M6 4h4v2h3v2h3v2h3v4h-3v2h-3v2h-3v2H6z",
  plus: "M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z",
  refresh: "M7 4h10v2h3v2h2v5h-4V9h-3V7H8v2H5v3H1V8h2V6h4zm-5 7h4v4h3v2h7v-2h3v-3h4v4h-2v2h-4v2H7v-2H4v-2H2z",
  reset: "M7 3h10v2h3v3h2v5h-4V9h-3V7H8v2H5v7h3v2h7v-2h3v-2h4v3h-2v3h-3v2H7v-2H4v-3H2V8h2V5h3z",
  trash: "M8 3h8v2h5v4H3V5h5zm-3 8h14v10H5zm3 2v6h2v-6zm6 0v6h2v-6z",
} as const

export function PixelIcon({ className, name, title }: PixelIconProps) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      className={className}
      fill="currentColor"
      role={title ? "img" : undefined}
      shapeRendering="crispEdges"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <path d={PIXEL_PATHS[name]} />
    </svg>
  )
}
