import type { ScreenProtectionProps } from "@/types/settings";

export function ScreenProtection({
  children,
  enabled,
  nightModeActive,
}: ScreenProtectionProps) {
  const classes = [
    "h-full w-full overflow-hidden bg-display-bg transition-[filter] duration-700 ease-out",
    enabled
      ? "animate-[oled-pixel-shift_8min_steps(1,end)_infinite] will-change-transform"
      : "",
    nightModeActive ? "brightness-[0.42]" : "",
  ].join(" ");

  return (
    <div className={classes} data-night-mode-active={nightModeActive}>
      {children}
    </div>
  );
}
