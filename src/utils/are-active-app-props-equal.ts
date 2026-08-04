import type { ActiveAppProps } from "@/types/apps";

export function areActiveAppPropsEqual(
  previous: ActiveAppProps,
  next: ActiveAppProps,
) {
  if (
    previous.activeApp !== next.activeApp ||
    previous.language !== next.language ||
    previous.onTap !== next.onTap
  ) {
    return false;
  }

  switch (next.activeApp) {
    case "stripe":
      return previous.isAnnual === next.isAnnual && previous.mrr === next.mrr;
    case "weather":
      return (
        previous.weather === next.weather &&
        previous.weatherIcon === next.weatherIcon
      );
    case "spotify":
      return (
        previous.spotify === next.spotify &&
        (!next.spotify.isPlaying ||
          previous.now.getTime() === next.now.getTime())
      );
    case "calendar":
      return (
        previous.calendar === next.calendar &&
        previous.now.getTime() === next.now.getTime()
      );
    case "twitter":
      return (
        previous.twitter === next.twitter &&
        previous.twitterSlideIndex === next.twitterSlideIndex
      );
    case "codex-usage":
      return (
        previous.agentUsage === next.agentUsage &&
        previous.codexUsageSlideIndex === next.codexUsageSlideIndex &&
        previous.now.getTime() === next.now.getTime()
      );
    case "claude-usage":
      return (
        previous.agentUsage === next.agentUsage &&
        previous.claudeUsageSlideIndex === next.claudeUsageSlideIndex &&
        previous.now.getTime() === next.now.getTime()
      );
    case "clock":
    case "world":
    case "moon":
    case "progress":
      return previous.now.getTime() === next.now.getTime();
    case "daylight":
      return (
        previous.now.getTime() === next.now.getTime() &&
        previous.weather === next.weather
      );
    case "system":
      return previous.system === next.system;
    case "marquee":
      return (
        previous.calendar === next.calendar &&
        previous.mrr === next.mrr &&
        previous.now.getTime() === next.now.getTime() &&
        previous.productivity === next.productivity &&
        previous.spotify === next.spotify &&
        previous.system === next.system &&
        previous.twitter === next.twitter &&
        previous.weather === next.weather &&
        previous.weatherIcon === next.weatherIcon
      );
    default:
      return true;
  }
}
