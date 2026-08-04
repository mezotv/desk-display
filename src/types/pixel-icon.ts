export type PixelIconName =
  | "back"
  | "backspace"
  | "check"
  | "close"
  | "minus"
  | "pause"
  | "play"
  | "plus"
  | "refresh"
  | "reset"
  | "trash"

export type PixelIconProps = {
  className?: string
  name: PixelIconName
  title?: string
}
